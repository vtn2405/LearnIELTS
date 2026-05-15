-- AlterTable
ALTER TABLE "ErrorHunterError" ADD COLUMN     "acceptedAnswers" TEXT[],
ADD COLUMN     "detectionDifficulty" INTEGER,
ADD COLUMN     "errorVisibility" TEXT,
ADD COLUMN     "explanationVi" TEXT,
ADD COLUMN     "relatedGrammar" TEXT;

-- AlterTable
ALTER TABLE "ErrorHunterPassage" ADD COLUMN     "collocations" JSONB,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "speakingCueCard" JSONB;
