// app/exercises/error-hunter/data/seed-passages.ts
// Seeds ErrorHunterPassage + ErrorHunterError tables from JSON files.
//
// Usage:
//   npx tsx app/exercises/error-hunter/data/seed-passages.ts
//   npx tsx app/exercises/error-hunter/data/seed-passages.ts --dry-run

import { PrismaClient, Prisma } from "@prisma/client";
import { readFileSync, readdirSync, existsSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

interface PassageJson {
  slug: string;
  title?: string;
  titleVi?: string;
  topic: string;
  taskType: string;
  bandTarget: number;
  minUnitIndex: number;
  maxUnitIndex: number;
  grammarFocus: string[];
  difficulty: string;
  packId: string;
  questionPrompt: string;
  questionPromptVi?: string;
  passageText: string;
  totalErrors: number;
  falseAlarmZones?: {
    startIndex: number;
    endIndex: number;
    text: string;
    hint: string;
  }[];
  errors: {
    startIndex: number;
    endIndex: number;
    errorText: string;
    correctText: string;
    errorType: string;
    severity: string;
    explanation: string;
    grammarRuleCode?: string;
    ieltsTipErrorType?: string;
  }[];
  collocations?: unknown[];
  tips?: unknown[];
}

async function seedPassages(dryRun: boolean): Promise<void> {
  const dataDir = path.join(process.cwd(), "data", "error-hunter");

  if (!existsSync(dataDir)) {
    console.error(`Data directory not found: ${dataDir}`);
    process.exit(1);
  }

  const packDirs = readdirSync(dataDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith("pack-units-"))
    .map((d) => d.name)
    .sort();

  console.log(`Found ${packDirs.length} pack directories.\n`);

  let totalPassages = 0;
  let totalErrors = 0;
  let failed = 0;

  for (const packDir of packDirs) {
    const packPath = path.join(dataDir, packDir);
    const jsonFiles = readdirSync(packPath)
      .filter((f) => f.endsWith(".json"))
      .sort();

    console.log(`── ${packDir} (${jsonFiles.length} passages) ──`);

    for (const jsonFile of jsonFiles) {
      const filePath = path.join(packPath, jsonFile);

      try {
        const raw = readFileSync(filePath, "utf-8");
        const data: PassageJson = JSON.parse(raw);

        if (!data.slug || !data.passageText || !data.errors) {
          throw new Error("Missing required fields");
        }

        if (dryRun) {
          console.log(`  ✓ [dry] ${data.slug} — ${data.errors.length} errors`);
          totalPassages++;
          totalErrors += data.errors.length;
          continue;
        }

        // Look up GrammarRule IDs for each error
        const grammarRuleCodes = [
          ...new Set(
            data.errors
              .map((e) => e.grammarRuleCode)
              .filter((c): c is string => !!c)
          ),
        ];
        const grammarRules = await prisma.grammarRule.findMany({
          where: { code: { in: grammarRuleCodes } },
          select: { id: true, code: true },
        });
        const ruleMap = new Map(grammarRules.map((r) => [r.code, r.id]));

        // Look up IeltsTip IDs for each error
        const tipErrorTypes = [
          ...new Set(
            data.errors
              .map((e) => e.ieltsTipErrorType)
              .filter((t): t is string => !!t)
          ),
        ];
        const ieltsTips = await prisma.ieltsTip.findMany({
          where: { errorType: { in: tipErrorTypes } },
          select: { id: true, errorType: true },
        });
        // Pick first tip per errorType
        const tipMap = new Map<string, string>();
        for (const tip of ieltsTips) {
          if (!tipMap.has(tip.errorType)) {
            tipMap.set(tip.errorType, tip.id);
          }
        }

        // Upsert passage
        const passage = await prisma.errorHunterPassage.upsert({
          where: { slug: data.slug },
          update: {
            title: data.title ?? null,
            titleVi: data.titleVi ?? null,
            topic: data.topic,
            taskType: data.taskType as any,
            bandTarget: data.bandTarget,
            minUnitIndex: data.minUnitIndex,
            maxUnitIndex: data.maxUnitIndex,
            grammarFocus: data.grammarFocus,
            difficulty: data.difficulty as any,
            packId: data.packId,
            questionPrompt: data.questionPrompt,
            questionPromptVi: data.questionPromptVi ?? null,
            passageText: data.passageText,
            totalErrors: data.totalErrors,
            falseAlarmZones: (data.falseAlarmZones ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            collocations: (data.collocations ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            tips: (data.tips ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            updatedAt: new Date(),
          },
          create: {
            slug: data.slug,
            title: data.title ?? null,
            titleVi: data.titleVi ?? null,
            topic: data.topic,
            taskType: data.taskType as any,
            bandTarget: data.bandTarget,
            minUnitIndex: data.minUnitIndex,
            maxUnitIndex: data.maxUnitIndex,
            grammarFocus: data.grammarFocus,
            difficulty: data.difficulty as any,
            packId: data.packId,
            questionPrompt: data.questionPrompt,
            questionPromptVi: data.questionPromptVi ?? null,
            passageText: data.passageText,
            totalErrors: data.totalErrors,
            falseAlarmZones: (data.falseAlarmZones ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            collocations: (data.collocations ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            tips: (data.tips ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          },
        });

        // Delete existing errors for this passage (to re-seed cleanly)
        await prisma.errorHunterError.deleteMany({
          where: { passageId: passage.id },
        });

        // Create errors
        for (const err of data.errors) {
          await prisma.errorHunterError.create({
            data: {
              passageId: passage.id,
              startIndex: err.startIndex,
              endIndex: err.endIndex,
              errorText: err.errorText,
              correctText: err.correctText,
              errorType: err.errorType,
              severity: (err.severity as any) ?? "MAJOR",
              explanation: err.explanation,
              grammarRuleId: err.grammarRuleCode
                ? ruleMap.get(err.grammarRuleCode) ?? null
                : null,
              ieltsTipId: err.ieltsTipErrorType
                ? tipMap.get(err.ieltsTipErrorType) ?? null
                : null,
            },
          });
        }

        console.log(
          `  ✓ ${data.slug} — ${data.errors.length} errors seeded`
        );
        totalPassages++;
        totalErrors += data.errors.length;
      } catch (e: unknown) {
        console.error(
          `  ✗ ${jsonFile}: ${e instanceof Error ? e.message : e}`
        );
        failed++;
      }
    }
  }

  console.log(
    `\n→ ${totalPassages} passages, ${totalErrors} errors seeded. ${failed} failed.`
  );
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  if (dryRun) console.log("Running in DRY-RUN mode — no DB writes.\n");

  try {
    await seedPassages(dryRun);
    console.log("\nDone.\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
