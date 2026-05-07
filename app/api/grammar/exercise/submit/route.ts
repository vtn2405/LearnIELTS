import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../../lib/prisma";
import { calcNextReviewAt } from "../../../../../lib/spaced-repetition";
import { gradeWithAi } from "../../../../../lib/gemini-grader";

import { Prisma } from "@prisma/client";
import { ensureUserExists } from "../../../../../lib/ensureUserExists";

// XP mỗi lần làm bài
const XP_CORRECT = 10;
const XP_PARTIAL = 5; // AI score >= 70 nhưng < 90
const XP_ATTEMPT = 2; // Nỗ lực dù sai hoàn toàn

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in our database and use DB UUID for reads/writes
    const dbUser = await ensureUserExists(userId);
    const dbUserId = dbUser.id;

    const body = (await req.json()) as {
      exerciseId: string;
      userAnswer: string;
    };
    const { exerciseId, userAnswer } = body;

    if (!exerciseId || userAnswer === undefined || userAnswer === null) {
      return NextResponse.json(
        { error: "Thiếu exerciseId hoặc userAnswer." },
        { status: 400 },
      );
    }

    // 1. Tìm exercise
    const exercise = await prisma.grammarExercise.findUnique({
      where: { id: exerciseId },
      select: {
        id: true,
        type: true,
        prompt: true,
        answer: true,
        solution: true,
        useAiGrading: true,
        lessonId: true,
        lesson: {
          select: {
            ieltsWritingTags: true,
            ieltsSpeakingTags: true,
          },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Không tìm thấy bài tập." },
        { status: 404 },
      );
    }

    // 2. Lấy kết quả gần nhất để tính reviewCount
    const lastResult = await prisma.grammarExerciseResult.findFirst({
      where: { userId: dbUserId, exerciseId },
      orderBy: { practicedAt: "desc" },
      select: { reviewCount: true },
    });

    const currentReviewCount = lastResult?.reviewCount ?? 0;

    // 3. Chấm bài
    let isCorrect = false;
    let feedback: Prisma.InputJsonValue;

    if (exercise.useAiGrading) {
      // AI grading
      const aiResult = await gradeWithAi(
        exercise.prompt,
        userAnswer,
        exercise.answer ?? exercise.solution,
        exercise.type,
      );
      isCorrect = aiResult.isCorrect;
      feedback = {
        type: "ai",
        isAcceptable: aiResult.isAcceptable,
        score: aiResult.score,
        feedbackVi: aiResult.feedbackVi,
        suggestedAnswer: aiResult.suggestedAnswer,
      };
    } else {
      // So sánh đơn giản (trim + lowercase)
      const normalizedUser = userAnswer.trim().toLowerCase();
      const normalizedAnswer = (exercise.answer ?? "").trim().toLowerCase();
      isCorrect = normalizedUser === normalizedAnswer;
      feedback = {
        type: "exact",
        correctAnswer: exercise.answer,
        explanation: exercise.solution,
      };
    }

    // 4. Tính Spaced Repetition
    const { nextReviewAt, nextReviewCount } = calcNextReviewAt(
      isCorrect,
      currentReviewCount,
    );

    // 5. Tính XP và score để lưu
    let rawScore: number;
    let xpEarned: number;

    if (exercise.useAiGrading) {
      // Lấy score thực từ AI result
      const aiFeedback = feedback as { score?: number };
      rawScore = aiFeedback.score ?? (isCorrect ? 100 : 0);
      if (rawScore >= 90) xpEarned = XP_CORRECT;
      else if (rawScore >= 70) xpEarned = XP_PARTIAL;
      else xpEarned = XP_ATTEMPT;
    } else {
      rawScore = isCorrect ? 100 : 0;
      xpEarned = isCorrect ? XP_CORRECT : XP_ATTEMPT;
    }

    // 6. Lưu ExerciseResult
    await prisma.grammarExerciseResult.create({
      data: {
        userId: dbUserId,
        exerciseId,
        isCorrect,
        score: rawScore,
        feedback,
        nextReviewAt,
        reviewCount: nextReviewCount,
        practicedAt: new Date(),
      },
    });

    // 6b. Cộng XP vào User.totalXp
    await prisma.user.update({
      where: { id: dbUserId },
      data: { totalXp: { increment: xpEarned } },
    });

    // 7. Nếu sai → upsert MistakeLog
    if (!isCorrect) {
      const grammarTags = [
        ...exercise.lesson.ieltsWritingTags,
        ...exercise.lesson.ieltsSpeakingTags,
      ];
      const grammarTag =
        grammarTags.length > 0 ? grammarTags[0] : "general-grammar";

      const existingMistake = await prisma.mistakeLog.findFirst({
        where: {
          userId: dbUserId,
          lessonId: exercise.lessonId,
          grammarTag,
        },
      });

      if (existingMistake) {
        await prisma.mistakeLog.update({
          where: { id: existingMistake.id },
          data: {
            occurrences: { increment: 1 },
            wrongAnswer: userAnswer,
            correction: exercise.answer ?? exercise.solution,
          },
        });
      } else {
        await prisma.mistakeLog.create({
          data: {
            userId: dbUserId,
            lessonId: exercise.lessonId,
            grammarTag,
            prompt: exercise.prompt,
            wrongAnswer: userAnswer,
            correction: exercise.answer ?? exercise.solution,
            occurrences: 1,
          },
        });
      }
    }

    // Lấy totalXp mới nhất để trả về cho frontend
    const updatedUser = await prisma.user.findUnique({
      where: { id: dbUserId },
      select: { totalXp: true },
    });

    return NextResponse.json({
      isCorrect,
      feedback,
      nextReviewAt,
      xpEarned,
      reviewCount: nextReviewCount,
      totalXp: updatedUser?.totalXp ?? 0,
    });
  } catch (error) {
    console.error(
      "[POST /api/grammar/exercise/submit]",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );
    return NextResponse.json(
      { error: "Không thể chấm bài. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
