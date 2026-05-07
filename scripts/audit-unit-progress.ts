/**
 * Audit script: Check all UnitProgress rows to find data with missing completedAt
 * Run: npx tsx scripts/audit-unit-progress.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== AUDIT: UnitProgress rows ===\n");

  // 1. Get ALL UnitProgress rows
  const allProgress = await prisma.unitProgress.findMany({
    orderBy: [{ clerkId: "asc" }, { unitId: "asc" }],
  });

  console.log(`Total UnitProgress rows: ${allProgress.length}\n`);

  if (allProgress.length === 0) {
    console.log("⚠️  NO UnitProgress rows found in DB at all!");
    console.log("   → 3 completed units likely exist ONLY in localStorage.");
    return;
  }

  // 2. Show all rows with their completedAt status
  console.log("| clerkId (last 8) | unitId                    | completedAt        | bestBand | attemptCount | lastAttemptedAt    | xpEarned |");
  console.log("|------------------|---------------------------|--------------------|----------|--------------|--------------------|----------|");

  for (const row of allProgress) {
    const shortClerk = row.clerkId.slice(-8);
    const completed = row.completedAt
      ? row.completedAt.toISOString().slice(0, 19)
      : "NULL";
    const lastAttempt = row.lastAttemptedAt
      ? row.lastAttemptedAt.toISOString().slice(0, 19)
      : "NULL";
    console.log(
      `| ${shortClerk.padEnd(16)} | ${row.unitId.padEnd(25)} | ${completed.padEnd(18)} | ${String(row.bestBand ?? "NULL").padEnd(8)} | ${String(row.attemptCount).padEnd(12)} | ${lastAttempt.padEnd(18)} | ${String(row.xpEarned).padEnd(8)} |`
    );
  }

  // 3. Identify rows that look "completed" but have no completedAt
  const missingCompletedAt = allProgress.filter(
    (r: (typeof allProgress)[number]) => r.completedAt === null && (r.attemptCount > 0 || r.bestBand !== null)
  );

  console.log(`\n=== Rows needing backfill (attemptCount>0 OR bestBand!=null, but completedAt=NULL) ===`);
  console.log(`Count: ${missingCompletedAt.length}`);
  for (const row of missingCompletedAt) {
    console.log(`  → ${row.unitId} (attempts=${row.attemptCount}, bestBand=${row.bestBand}, lastAttempted=${row.lastAttemptedAt?.toISOString() ?? "NULL"})`);
  }

  // 4. Show rows WITH completedAt (already good)
  const withCompletedAt = allProgress.filter((r: (typeof allProgress)[number]) => r.completedAt !== null);
  console.log(`\n=== Rows already having completedAt ===`);
  console.log(`Count: ${withCompletedAt.length}`);
  for (const row of withCompletedAt) {
    console.log(`  ✓ ${row.unitId} (completedAt=${row.completedAt?.toISOString()})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
