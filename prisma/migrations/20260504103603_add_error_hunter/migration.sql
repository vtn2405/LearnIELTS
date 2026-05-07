-- CreateEnum
CREATE TYPE "EhDifficulty" AS ENUM ('STARTER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "EhTaskType" AS ENUM ('WRITING_TASK2', 'SPEAKING_PART1', 'SPEAKING_PART2', 'SPEAKING_PART3');

-- CreateEnum
CREATE TYPE "EhErrorSeverity" AS ENUM ('MINOR', 'MAJOR', 'CRITICAL');

-- CreateTable
CREATE TABLE "GrammarRule" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrammarRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IeltsTip" (
    "id" TEXT NOT NULL,
    "errorType" TEXT NOT NULL,
    "tipText" TEXT NOT NULL,
    "bandNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IeltsTip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorHunterPassage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "taskType" "EhTaskType" NOT NULL,
    "bandTarget" DOUBLE PRECISION NOT NULL,
    "minUnitIndex" INTEGER NOT NULL,
    "maxUnitIndex" INTEGER NOT NULL,
    "grammarFocus" TEXT[],
    "difficulty" "EhDifficulty" NOT NULL,
    "packId" TEXT NOT NULL,
    "questionPrompt" TEXT NOT NULL,
    "passageText" TEXT NOT NULL,
    "totalErrors" INTEGER NOT NULL,
    "falseAlarmZones" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ErrorHunterPassage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorHunterError" (
    "id" TEXT NOT NULL,
    "passageId" TEXT NOT NULL,
    "startIndex" INTEGER NOT NULL,
    "endIndex" INTEGER NOT NULL,
    "errorText" TEXT NOT NULL,
    "correctText" TEXT NOT NULL,
    "errorType" TEXT NOT NULL,
    "severity" "EhErrorSeverity" NOT NULL DEFAULT 'MAJOR',
    "explanation" TEXT NOT NULL,
    "grammarRuleId" TEXT,
    "ieltsTipId" TEXT,

    CONSTRAINT "ErrorHunterError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorHunterAttempt" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "passageId" TEXT NOT NULL,
    "scorePercent" INTEGER NOT NULL,
    "foundCorrect" INTEGER NOT NULL,
    "missed" INTEGER NOT NULL,
    "falseAlarms" INTEGER NOT NULL,
    "fixAccuracy" INTEGER NOT NULL,
    "userSelections" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorHunterAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GrammarRule_code_key" ON "GrammarRule"("code");

-- CreateIndex
CREATE UNIQUE INDEX "IeltsTip_errorType_key" ON "IeltsTip"("errorType");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorHunterPassage_slug_key" ON "ErrorHunterPassage"("slug");

-- CreateIndex
CREATE INDEX "ErrorHunterPassage_packId_isActive_idx" ON "ErrorHunterPassage"("packId", "isActive");

-- CreateIndex
CREATE INDEX "ErrorHunterPassage_minUnitIndex_maxUnitIndex_idx" ON "ErrorHunterPassage"("minUnitIndex", "maxUnitIndex");

-- CreateIndex
CREATE INDEX "ErrorHunterError_passageId_idx" ON "ErrorHunterError"("passageId");

-- CreateIndex
CREATE INDEX "ErrorHunterAttempt_clerkId_createdAt_idx" ON "ErrorHunterAttempt"("clerkId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ErrorHunterAttempt_clerkId_passageId_idx" ON "ErrorHunterAttempt"("clerkId", "passageId");

-- AddForeignKey
ALTER TABLE "ErrorHunterError" ADD CONSTRAINT "ErrorHunterError_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "ErrorHunterPassage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorHunterError" ADD CONSTRAINT "ErrorHunterError_grammarRuleId_fkey" FOREIGN KEY ("grammarRuleId") REFERENCES "GrammarRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorHunterError" ADD CONSTRAINT "ErrorHunterError_ieltsTipId_fkey" FOREIGN KEY ("ieltsTipId") REFERENCES "IeltsTip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorHunterAttempt" ADD CONSTRAINT "ErrorHunterAttempt_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "ErrorHunterPassage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
