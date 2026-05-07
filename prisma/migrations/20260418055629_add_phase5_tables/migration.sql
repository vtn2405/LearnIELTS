/*
  Warnings:

  - You are about to drop the column `easeFactor` on the `ExerciseResult` table. All the data in the column will be lost.
  - You are about to drop the column `exerciseId` on the `ExerciseResult` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `ExerciseResult` table. All the data in the column will be lost.
  - You are about to drop the column `isCorrect` on the `ExerciseResult` table. All the data in the column will be lost.
  - You are about to drop the column `nextReviewAt` on the `ExerciseResult` table. All the data in the column will be lost.
  - You are about to drop the column `practicedAt` on the `ExerciseResult` table. All the data in the column will be lost.
  - You are about to drop the column `reviewCount` on the `ExerciseResult` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `ExerciseResult` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ExerciseResult` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ExerciseResult` table. All the data in the column will be lost.
  - Added the required column `clerkId` to the `ExerciseResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exerciseType` to the `ExerciseResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skill` to the `ExerciseResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `ExerciseResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExerciseResult" DROP CONSTRAINT "ExerciseResult_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "ExerciseResult" DROP CONSTRAINT "ExerciseResult_userId_fkey";

-- AlterTable
ALTER TABLE "ExerciseResult" DROP COLUMN "easeFactor",
DROP COLUMN "exerciseId",
DROP COLUMN "feedback",
DROP COLUMN "isCorrect",
DROP COLUMN "nextReviewAt",
DROP COLUMN "practicedAt",
DROP COLUMN "reviewCount",
DROP COLUMN "score",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "accuracyPercent" INTEGER,
ADD COLUMN     "aiFeedback" JSONB,
ADD COLUMN     "bandEstimate" DOUBLE PRECISION,
ADD COLUMN     "clerkId" TEXT NOT NULL,
ADD COLUMN     "exerciseType" TEXT NOT NULL,
ADD COLUMN     "rawInput" TEXT,
ADD COLUMN     "skill" TEXT NOT NULL,
ADD COLUMN     "unitId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "GrammarExerciseResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "score" INTEGER,
    "feedback" JSONB,
    "nextReviewAt" TIMESTAMP(3),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "practicedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrammarExerciseResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingSession" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "transcript" TEXT,
    "audioPath" TEXT,
    "bandEstimate" DOUBLE PRECISION,
    "aiFeedback" JSONB,
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStreak" (
    "clerkId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),

    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("clerkId")
);

-- CreateTable
CREATE TABLE "UnitProgress" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "bestBand" DOUBLE PRECISION,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "xpEarned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UnitProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnitProgress_clerkId_unitId_key" ON "UnitProgress"("clerkId", "unitId");

-- CreateIndex
CREATE INDEX "ExerciseResult_clerkId_unitId_idx" ON "ExerciseResult"("clerkId", "unitId");

-- CreateIndex
CREATE INDEX "ExerciseResult_clerkId_createdAt_idx" ON "ExerciseResult"("clerkId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "GrammarExerciseResult" ADD CONSTRAINT "GrammarExerciseResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarExerciseResult" ADD CONSTRAINT "GrammarExerciseResult_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "GrammarExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
