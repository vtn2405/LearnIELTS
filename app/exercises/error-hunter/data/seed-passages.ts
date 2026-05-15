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
  type?: string;
  title?: string;
  titleVi?: string;
  topic: string;
  taskType: string;
  bandTarget: number;
  difficulty: string;
  // v5 fields
  unitId?: string;
  unitNum?: number;
  grammarFocus: string | string[];
  grammarPoint?: string;
  phase?: string;
  // Fallback format cũ
  minUnitIndex?: number;
  maxUnitIndex?: number;
  packId?: string;
  questionPrompt: string;
  questionPromptVi?: string;
  passageText: string;
  totalErrors: number;
  speakingCueCard?: { prompt: string; bulletPoints: string[] };
  falseAlarmZones?: {
    startIndex: number;
    endIndex: number;
    text: string;
    hint: string;
  }[];
  collocations?: {
    phrase: string;
    sourceInPassage: string;
    translation: string;
    exampleSentence: string;
    grammarNote: string;
  }[];
  metadata?: Record<string, unknown>;
  errors: {
    startIndex: number;
    endIndex: number;
    errorText: string;
    correctText: string;
    acceptedAnswers?: string[];
    errorType: string;
    relatedGrammar?: string;
    severity: string;
    explanation: string;
    explanationVi?: string;
    grammarRuleCode?: string;
    ieltsTipErrorType?: string;
    detectionDifficulty?: number;
    errorVisibility?: string;
  }[];
}

/** Tính packId từ unitNum (1-2→"pack-units-1-2", 3-4→"pack-units-3-4"...) */
function derivePackId(unitNum: number): string {
  const base = unitNum % 2 === 0 ? unitNum - 1 : unitNum;
  return `pack-units-${base}-${base + 1}`;
}

/** Chuẩn hóa grammarFocus: string → array */
function normalizeGrammarFocus(gf: string | string[]): string[] {
  return Array.isArray(gf) ? gf : [gf];
}

async function seedPassages(dryRun: boolean): Promise<void> {
  const dataDir = path.join(process.cwd(), "data", "error-hunter");

  if (!existsSync(dataDir)) {
    console.error(`Data directory not found: ${dataDir}`);
    process.exit(1);
  }

  const packDirs = readdirSync(dataDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
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
        const ruleMap = new Map<string, string>(grammarRules.map((r: { code: string; id: string }) => [r.code, r.id]));

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

        // Tính fields từ v5 format
        const unitNum = data.unitNum ?? data.minUnitIndex ?? 1;
        const minUnitIndex = data.minUnitIndex ?? unitNum;
        const maxUnitIndex = data.maxUnitIndex ?? unitNum;
        const packId = data.packId ?? derivePackId(unitNum);
        const grammarFocus = normalizeGrammarFocus(data.grammarFocus);

        // Upsert passage
        const passage = await prisma.errorHunterPassage.upsert({
          where: { slug: data.slug },
          update: {
            title: data.title ?? null,
            titleVi: data.titleVi ?? null,
            topic: data.topic,
            taskType: data.taskType as any,
            bandTarget: data.bandTarget,
            minUnitIndex: minUnitIndex,
            maxUnitIndex: maxUnitIndex,
            grammarFocus: grammarFocus,
            difficulty: data.difficulty as any,
            packId: packId,
            questionPrompt: data.questionPrompt,
            questionPromptVi: data.questionPromptVi ?? null,
            passageText: data.passageText,
            totalErrors: data.totalErrors,
            falseAlarmZones: data.falseAlarmZones ?? Prisma.DbNull,
            collocations: data.collocations ?? Prisma.DbNull,
            speakingCueCard: data.speakingCueCard ?? Prisma.DbNull,
            metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.DbNull,
            updatedAt: new Date(),
          },
          create: {
            slug: data.slug,
            title: data.title ?? null,
            titleVi: data.titleVi ?? null,
            topic: data.topic,
            taskType: data.taskType as any,
            bandTarget: data.bandTarget,
            minUnitIndex: minUnitIndex,
            maxUnitIndex: maxUnitIndex,
            grammarFocus: grammarFocus,
            difficulty: data.difficulty as any,
            packId: packId,
            questionPrompt: data.questionPrompt,
            questionPromptVi: data.questionPromptVi ?? null,
            passageText: data.passageText,
            totalErrors: data.totalErrors,
            falseAlarmZones: data.falseAlarmZones ?? Prisma.DbNull,
            collocations: data.collocations ?? Prisma.DbNull,
            speakingCueCard: data.speakingCueCard ?? Prisma.DbNull,
            metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.DbNull,
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
              acceptedAnswers: err.acceptedAnswers ?? [err.correctText],
              errorType: err.errorType,
              relatedGrammar: err.relatedGrammar ?? null,
              severity: (err.severity as any) ?? "MAJOR",
              explanation: err.explanation,
              explanationVi: err.explanationVi ?? null,
              detectionDifficulty: err.detectionDifficulty ?? null,
              errorVisibility: err.errorVisibility ?? null,
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
