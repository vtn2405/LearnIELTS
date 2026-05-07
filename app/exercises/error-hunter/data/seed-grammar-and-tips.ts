// scripts/seed-grammar-and-tips.ts
// Seeds GrammarRule and IeltsTip tables from JSON files.
//
// Usage:
//   npx tsx scripts/seed-grammar-and-tips.ts
//   npx tsx scripts/seed-grammar-and-tips.ts --dry-run
//   npx tsx scripts/seed-grammar-and-tips.ts --only=grammar
//   npx tsx scripts/seed-grammar-and-tips.ts --only=tips

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

// ─── JSON schemas ──────────────────────────────────────────────────────────────

interface GrammarRuleJson {
  code: string;
  title: string;
  description: string;
  examples: {
    wrong: string[];
    correct: string[];
  };
  errorType: string;
  unitIndex: number;
}

interface IeltsTipEntry {
  title: string;
  titleVi?: string;
  body: string;
  bodyVi?: string;
  targetBand: number;
}

interface IeltsTipJson {
  errorType: string;
  tips: IeltsTipEntry[];
}

// ─── Seed GrammarRules ────────────────────────────────────────────────────────

async function seedGrammarRules(dryRun: boolean): Promise<void> {
  const filePath = path.join(process.cwd(), "app", "exercises", "error-hunter", "data", "grammar-rules.json");
  const rules: GrammarRuleJson[] = JSON.parse(readFileSync(filePath, "utf-8"));

  console.log(`\nSeeding ${rules.length} GrammarRules…`);
  let ok = 0, failed = 0;

  for (const rule of rules) {
    try {
      if (!rule.code || !rule.title || !rule.errorType) {
        throw new Error(`Missing required fields in rule: ${JSON.stringify(rule)}`);
      }

      if (dryRun) {
        console.log(`  ✓ [dry] ${rule.code} — ${rule.title}`);
        ok++;
        continue;
      }

      await prisma.grammarRule.upsert({
        where: { code: rule.code },
        update: {
          title:       rule.title,
          description: rule.description,
          examples:    rule.examples as any,
          errorType:   rule.errorType,
          unitIndex:   rule.unitIndex,
          updatedAt:   new Date(),
        },
        create: {
          code:        rule.code,
          title:       rule.title,
          description: rule.description,
          examples:    rule.examples as any,
          errorType:   rule.errorType,
          unitIndex:   rule.unitIndex,
        },
      });

      console.log(`  ✓ ${rule.code} — ${rule.title}`);
      ok++;
    } catch (e: unknown) {
      console.error(`  ✗ ${rule.code ?? "unknown"}: ${e instanceof Error ? e.message : e}`);
      failed++;
    }
  }

  console.log(`  → ${ok} upserted, ${failed} failed.`);
}

// ─── Seed IeltsTips ───────────────────────────────────────────────────────────

async function seedIeltsTips(dryRun: boolean): Promise<void> {
  const filePath = path.join(process.cwd(), "app", "exercises", "error-hunter", "data", "ielts-tips.json");
  const groups: IeltsTipJson[] = JSON.parse(readFileSync(filePath, "utf-8"));

  // Flatten to one row per tip (errorType + title uniquely identifies a tip)
  const allTips = groups.flatMap((g) =>
    g.tips.map((t) => ({ errorType: g.errorType, ...t }))
  );

  console.log(`\nSeeding ${allTips.length} IeltsTips across ${groups.length} error types…`);
  let ok = 0, failed = 0;

  for (const tip of allTips) {
    try {
      if (!tip.errorType || !tip.title || !tip.body) {
        throw new Error(`Missing required fields: ${JSON.stringify(tip)}`);
      }

      if (dryRun) {
        console.log(`  ✓ [dry] ${tip.errorType} / ${tip.title}`);
        ok++;
        continue;
      }

      // Unique key: errorType + title combination
      await prisma.ieltsTip.upsert({
        where: {
          errorType_title: {
            errorType: tip.errorType,
            title:     tip.title,
          },
        },
        update: {
          titleVi:    tip.titleVi ?? null,
          body:       tip.body,
          bodyVi:     tip.bodyVi ?? null,
          targetBand: tip.targetBand,
          updatedAt:  new Date(),
        },
        create: {
          errorType:  tip.errorType,
          title:      tip.title,
          titleVi:    tip.titleVi ?? null,
          body:       tip.body,
          bodyVi:     tip.bodyVi ?? null,
          targetBand: tip.targetBand,
        },
      });

      console.log(`  ✓ ${tip.errorType} / ${tip.title}`);
      ok++;
    } catch (e: unknown) {
      console.error(`  ✗ ${tip.errorType}/${tip.title ?? "?"}: ${e instanceof Error ? e.message : e}`);
      failed++;
    }
  }

  console.log(`  → ${ok} upserted, ${failed} failed.`);
}

// ─── Summary ──────────────────────────────────────────────────────────────────

async function printLookupTable(): Promise<void> {
  const rules = await prisma.grammarRule.findMany({
    select: { code: true, errorType: true, title: true },
    orderBy: { code: "asc" },
  });

  const tipCounts = await prisma.ieltsTip.groupBy({
    by: ["errorType"],
    _count: { id: true },
  });

  const tipMap = Object.fromEntries(tipCounts.map((t: { errorType: string; _count: { id: number } }) => [t.errorType, t._count.id]));

  console.log("\n─── Lookup table for passage authors ───────────────────────────────────────");
  console.log("Use these codes when writing error-hunter passage JSON:\n");
  console.log("  grammarRuleCode  →  errorType             title");
  console.log("  " + "─".repeat(75));

  for (const rule of rules) {
    const tipCount = tipMap[rule.errorType] ?? 0;
    console.log(
      `  ${rule.code.padEnd(12)}  →  ${rule.errorType.padEnd(20)} ${rule.title.slice(0, 38)}` +
      (tipCount > 0 ? `` : ` ⚠ no IeltsTip for ${rule.errorType}`)
    );
  }

  console.log("\n  ieltsTipErrorType values (use exact string in passage JSON):");
  for (const [errorType, count] of Object.entries(tipMap)) {
    console.log(`    "${errorType}"  (${count} tips)`);
  }
  console.log("─".repeat(80));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args   = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const only   = args.find((a) => a.startsWith("--only="))?.replace("--only=", "");

  if (dryRun) console.log("Running in DRY-RUN mode — no DB writes.\n");

  try {
    if (!only || only === "grammar") await seedGrammarRules(dryRun);
    if (!only || only === "tips")    await seedIeltsTips(dryRun);

    if (!dryRun) await printLookupTable();

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
