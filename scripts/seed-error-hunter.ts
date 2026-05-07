// scripts/seed-error-hunter.ts
// Seeds Error Hunter passages from JSON files under data/error-hunter/
//
// Usage:
//   npx tsx scripts/seed-error-hunter.ts
//   npx tsx scripts/seed-error-hunter.ts --pack pack-units-1-2   (single pack)
//   npx tsx scripts/seed-error-hunter.ts --dry-run               (validate only)

import { PrismaClient, Prisma } from "@prisma/client";
import { readdirSync, readFileSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

// ─── JSON schema ──────────────────────────────────────────────────────────────

interface ErrorJson {
  startIndex: number;
  endIndex: number;
  errorText: string;
  correctText: string;
  errorType: string;
  severity: "MINOR" | "MAJOR" | "CRITICAL";
  explanation: string;
  grammarRuleCode?: string;
  ieltsTipErrorType?: string;
}

interface FalseAlarmZoneJson {
  startIndex: number;
  endIndex: number;
  text: string;
  hint: string;
}

interface PassageJson {
  slug: string;
  topic: string;
  taskType: string;
  bandTarget: number;
  minUnitIndex: number;
  maxUnitIndex: number;
  grammarFocus: string[];
  difficulty: string;
  packId: string;
  questionPrompt: string;
  passageText: string;
  falseAlarmZones?: FalseAlarmZoneJson[];
  errors: ErrorJson[];
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validatePassage(json: PassageJson, file: string): void {
  if (!json.slug) throw new Error(`[${file}] Missing required field: slug`);

  for (const err of json.errors) {
    const slice = json.passageText.slice(err.startIndex, err.endIndex);
    if (slice !== err.errorText) {
      throw new Error(
        `[${file}] Offset mismatch for "${err.errorText}":\n` +
        `  Expected: "${err.errorText}"\n` +
        `  Found at [${err.startIndex}, ${err.endIndex}]: "${slice}"\n` +
        `  Hint: use passageText.indexOf("${err.errorText}") to find the right index.`
      );
    }
  }

  // Validate falseAlarmZones offsets too
  for (const zone of json.falseAlarmZones ?? []) {
    const slice = json.passageText.slice(zone.startIndex, zone.endIndex);
    if (slice !== zone.text) {
      throw new Error(
        `[${file}] falseAlarmZone offset mismatch for "${zone.text}": got "${slice}"`
      );
    }
  }
}

// ─── Seed one passage ─────────────────────────────────────────────────────────

async function seedPassage(
  json: PassageJson,
  file: string,
  dryRun: boolean
): Promise<void> {
  validatePassage(json, file);

  if (dryRun) {
    console.log(`  ✓ [dry-run] ${json.slug} — ${json.errors.length} errors, offsets OK`);
    return;
  }

  const passage = await prisma.errorHunterPassage.upsert({
    where:  { slug: json.slug },
    update: {
      passageText:     json.passageText,
      questionPrompt:  json.questionPrompt,
      totalErrors:     json.errors.length,
      falseAlarmZones: (json.falseAlarmZones ?? []) as unknown as Prisma.InputJsonValue,
      isActive:        true,
      updatedAt:       new Date(),
    },
    create: {
      slug:            json.slug,
      topic:           json.topic,
      taskType:        json.taskType as any,
      bandTarget:      json.bandTarget,
      minUnitIndex:    json.minUnitIndex,
      maxUnitIndex:    json.maxUnitIndex,
      grammarFocus:    json.grammarFocus,
      difficulty:      json.difficulty as any,
      packId:          json.packId,
      questionPrompt:  json.questionPrompt,
      passageText:     json.passageText,
      totalErrors:     json.errors.length,
      falseAlarmZones: (json.falseAlarmZones ?? []) as unknown as Prisma.InputJsonValue,
      isActive:        true,
    },
  });

  // Replace errors fresh (idempotent)
  await prisma.errorHunterError.deleteMany({ where: { passageId: passage.id } });

  for (const err of json.errors) {
    const [grammarRule, ieltsTip] = await Promise.all([
      err.grammarRuleCode
        ? prisma.grammarRule.findUnique({ where: { code: err.grammarRuleCode } })
        : null,
      err.ieltsTipErrorType
        ? prisma.ieltsTip.findFirst({ where: { errorType: err.ieltsTipErrorType } })
        : null,
    ]);

    await prisma.errorHunterError.create({
      data: {
        passageId:     passage.id,
        startIndex:    err.startIndex,
        endIndex:      err.endIndex,
        errorText:     err.errorText,
        correctText:   err.correctText,
        errorType:     err.errorType,
        severity:      err.severity,
        explanation:   err.explanation,
        grammarRuleId: grammarRule?.id ?? null,
        ieltsTipId:    ieltsTip?.id ?? null,
      },
    });
  }

  console.log(`  ✓ ${json.slug} — ${json.errors.length} errors seeded`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args    = process.argv.slice(2);
  const dryRun  = args.includes("--dry-run");
  const packArg = args.find((a) => a.startsWith("--pack="))?.replace("--pack=", "")
    ?? args[args.indexOf("--pack") + 1];

  const dataDir = path.join(process.cwd(), "data", "error-hunter");
  const packs   = readdirSync(dataDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && (!packArg || d.name === packArg))
    .map((d) => d.name);

  if (packs.length === 0) {
    console.error(`No pack directories found${packArg ? ` matching "${packArg}"` : ""}.`);
    process.exit(1);
  }

  let total = 0, errors = 0;

  for (const pack of packs) {
    console.log(`\nPack: ${pack}`);
    const files = readdirSync(path.join(dataDir, pack)).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      try {
        const json: PassageJson = JSON.parse(
          readFileSync(path.join(dataDir, pack, file), "utf-8")
        );
        await seedPassage(json, file, dryRun);
        total++;
      } catch (e: unknown) {
        console.error(`  ✗ ${file}: ${e instanceof Error ? e.message : e}`);
        errors++;
      }
    }
  }

  console.log(`\n${dryRun ? "[dry-run] " : ""}Done: ${total} passages OK, ${errors} failed.\n`);
  await prisma.$disconnect();

  if (errors > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
