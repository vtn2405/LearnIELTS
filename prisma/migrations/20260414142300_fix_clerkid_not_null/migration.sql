-- Bước 1: Xóa tất cả records liên quan đến user NULL clerkId (theo thứ tự FK)
DELETE FROM "ExerciseResult" WHERE "userId" IN (SELECT id FROM "User" WHERE "clerkId" IS NULL);
DELETE FROM "MistakeLog" WHERE "userId" IN (SELECT id FROM "User" WHERE "clerkId" IS NULL);
DELETE FROM "WritingSubmission" WHERE "userId" IN (SELECT id FROM "User" WHERE "clerkId" IS NULL);
DELETE FROM "SpeakingSubmission" WHERE "userId" IN (SELECT id FROM "User" WHERE "clerkId" IS NULL);
DELETE FROM "UserProgress" WHERE "userId" IN (SELECT id FROM "User" WHERE "clerkId" IS NULL);
DELETE FROM "ModuleProgress" WHERE "userId" IN (SELECT id FROM "User" WHERE "clerkId" IS NULL);

-- Bước 2: Xóa user không có clerkId (test records)
DELETE FROM "User" WHERE "clerkId" IS NULL;

-- Bước 3: Make clerkId NOT NULL
ALTER TABLE "User" ALTER COLUMN "clerkId" SET NOT NULL;

-- Bước 4: Add UNIQUE constraint on clerkId (nếu chưa tồn tại)
CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User"("clerkId");
