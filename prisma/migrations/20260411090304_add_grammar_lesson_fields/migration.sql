-- AlterTable
ALTER TABLE "GrammarLesson" ADD COLUMN     "collocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "commonMistakes" TEXT,
ADD COLUMN     "exampleAcademic" TEXT,
ADD COLUMN     "exampleSpoken" TEXT,
ADD COLUMN     "speakingStructures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "theoryMd" TEXT,
ADD COLUMN     "usageNoteSpoken" TEXT,
ADD COLUMN     "usageNoteTask2" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totalXp" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN     "xpEarned" INTEGER NOT NULL DEFAULT 0;
