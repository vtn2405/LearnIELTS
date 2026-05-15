/*
  Warnings:

  - You are about to drop the column `unitId` on the `GrammarRule` table. All the data in the column will be lost.
  - You are about to drop the column `bandNote` on the `IeltsTip` table. All the data in the column will be lost.
  - You are about to drop the column `tipText` on the `IeltsTip` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[errorType,title]` on the table `IeltsTip` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `errorType` to the `GrammarRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examples` to the `GrammarRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitIndex` to the `GrammarRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `GrammarRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `body` to the `IeltsTip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `IeltsTip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `IeltsTip` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "IeltsTip_errorType_key";

-- AlterTable
ALTER TABLE "ErrorHunterPassage" ADD COLUMN     "questionPromptVi" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "titleVi" TEXT;

-- AlterTable
ALTER TABLE "GrammarRule" DROP COLUMN "unitId",
ADD COLUMN     "errorType" TEXT NOT NULL,
ADD COLUMN     "examples" JSONB NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "unitIndex" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "IeltsTip" DROP COLUMN "bandNote",
DROP COLUMN "tipText",
ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "bodyVi" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "targetBand" DOUBLE PRECISION NOT NULL DEFAULT 6.0,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "titleVi" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "GrammarRule_errorType_idx" ON "GrammarRule"("errorType");

-- CreateIndex
CREATE INDEX "GrammarRule_unitIndex_idx" ON "GrammarRule"("unitIndex");

-- CreateIndex
CREATE INDEX "IeltsTip_errorType_idx" ON "IeltsTip"("errorType");

-- CreateIndex
CREATE UNIQUE INDEX "IeltsTip_errorType_title_key" ON "IeltsTip"("errorType", "title");
