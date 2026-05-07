-- Kiểm tra column clerkId không còn NULL
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'User' AND column_name = 'clerkId';

-- Kiểm tra index tồn tại
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'User';

-- Kiểm tra không còn record NULL
SELECT COUNT(*) as null_count FROM "User" WHERE "clerkId" IS NULL;

-- Hiển thị tất cả user còn lại
SELECT id, email, "clerkId", role FROM "User";

-- Kiểm tra migration đã được ghi nhận
SELECT migration_name, finished_at, applied_steps_count 
FROM "_prisma_migrations" 
ORDER BY started_at DESC 
LIMIT 5;
