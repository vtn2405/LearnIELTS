-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('MULTIPLE_CHOICE', 'FILL_IN_BLANK', 'REWRITE_SENTENCE', 'ERROR_CORRECTION', 'REGISTER_SHIFT', 'SENTENCE_COMBINING', 'SPEAKING_DRILL');

-- CreateEnum
CREATE TYPE "WritingTaskType" AS ENUM ('TASK1_ACADEMIC', 'TASK1_GENERAL', 'TASK2_OPINION', 'TASK2_DISCUSSION', 'TASK2_PROBLEM_SOLUTION');

-- CreateEnum
CREATE TYPE "SpeakingPart" AS ENUM ('PART1', 'PART2', 'PART3');

-- CreateTable
CREATE TABLE "GrammarChapter" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrammarChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarLesson" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "ieltsWritingTags" TEXT[],
    "ieltsSpeakingTags" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrammarLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarExercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "type" "ExerciseType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB,
    "answer" TEXT,
    "solution" TEXT,
    "useAiGrading" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrammarExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseResult" (
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

    CONSTRAINT "ExerciseResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MistakeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT,
    "grammarTag" TEXT NOT NULL,
    "prompt" TEXT,
    "wrongAnswer" TEXT,
    "correction" TEXT,
    "occurrences" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MistakeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingPrompt" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "promptText" TEXT NOT NULL,
    "taskType" "WritingTaskType" NOT NULL,
    "sampleAnswer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "responseText" TEXT NOT NULL,
    "score" INTEGER,
    "feedback" JSONB,
    "isFromAi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingPrompt" (
    "id" TEXT NOT NULL,
    "part" "SpeakingPart" NOT NULL,
    "title" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "sampleAnswer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "audioUrl" TEXT,
    "fluencyScore" INTEGER,
    "vocabularyTags" TEXT[],
    "feedback" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "module" "Module" NOT NULL,
    "currentLessonId" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GrammarChapter_slug_key" ON "GrammarChapter"("slug");

-- AddForeignKey
ALTER TABLE "GrammarLesson" ADD CONSTRAINT "GrammarLesson_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "GrammarChapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarExercise" ADD CONSTRAINT "GrammarExercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "GrammarLesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseResult" ADD CONSTRAINT "ExerciseResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseResult" ADD CONSTRAINT "ExerciseResult_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "GrammarExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MistakeLog" ADD CONSTRAINT "MistakeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MistakeLog" ADD CONSTRAINT "MistakeLog_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "GrammarLesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingSubmission" ADD CONSTRAINT "WritingSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingSubmission" ADD CONSTRAINT "WritingSubmission_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "WritingPrompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingSubmission" ADD CONSTRAINT "SpeakingSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingSubmission" ADD CONSTRAINT "SpeakingSubmission_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "SpeakingPrompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_currentLessonId_fkey" FOREIGN KEY ("currentLessonId") REFERENCES "GrammarLesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
