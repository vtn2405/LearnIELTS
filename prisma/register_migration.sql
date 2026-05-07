INSERT INTO "_prisma_migrations" (
  id,
  checksum,
  finished_at,
  migration_name,
  logs,
  rolled_back_at,
  started_at,
  applied_steps_count
)
SELECT
  gen_random_uuid()::text,
  'manually_applied_fix_clerkid_not_null',
  NOW(),
  '20260414142300_fix_clerkid_not_null',
  NULL,
  NULL,
  NOW(),
  1
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20260414142300_fix_clerkid_not_null'
);
