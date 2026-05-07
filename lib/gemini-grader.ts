/**
 * Gemini AI Grader — dùng cho bài tập mở (useAiGrading = true)
 * Gọi qua Railway proxy theo cấu hình trong CONTEXT.md
 *
 * NOTE (2026-05-04): src/lib/gemini.ts đã được comment (dead code).
 * File này cũng không có caller nào. Giữ lại để tham khảo.
 * generateContent được stub lại tại đây để tránh tsc error.
 */

// Dead code — no active callers found (2026-05-04 audit).
// Stub replaces the commented-out export in src/lib/gemini.ts.
async function generateContent(_prompt: string): Promise<string> {
  throw new Error("gemini-grader: generateContent is not active. Use the OpenAI-compat proxy instead.");
}

export interface AiGradeResult {
  isCorrect: boolean;
  isAcceptable: boolean;
  score: number; // 0–100
  feedbackVi: string;
  suggestedAnswer: string;
}

/**
 * Chấm bài tập mở bằng Gemini.
 *
 * @param prompt       - Đề bài (exercise.prompt)
 * @param userAnswer   - Câu trả lời của học viên
 * @param correctAnswer - Đáp án gợi ý / đáp án mẫu (có thể null)
 * @param exerciseType - Loại bài tập (REWRITE_SENTENCE, REGISTER_SHIFT, etc.)
 */
export async function gradeWithAi(
  prompt: string,
  userAnswer: string,
  correctAnswer: string | null,
  exerciseType: string,
): Promise<AiGradeResult> {
  const systemPrompt = `Bạn là giáo viên IELTS chuyên chấm bài ngữ pháp tiếng Anh cho học viên Việt Nam.
Nhiệm vụ: Chấm câu trả lời của học viên theo tiêu chí IELTS.

Quy tắc:
- Chấp nhận nhiều cách diễn đạt đúng ngữ pháp, không cứng nhắc về một đáp án duy nhất.
- Phản hồi bằng tiếng Việt, ví dụ sửa bằng tiếng Anh.
- Score: 0-100 (>= 70 là chấp nhận được).

Trả về JSON hợp lệ theo format sau (KHÔNG thêm markdown code block):
{
  "isAcceptable": boolean,
  "score": number,
  "feedbackVi": "Nhận xét tiếng Việt ngắn gọn (1-2 câu)",
  "suggestedAnswer": "Câu sửa hoặc gợi ý tốt hơn bằng tiếng Anh"
}`;

  const userPrompt = `Loại bài: ${exerciseType}
Đề: ${prompt}
${correctAnswer ? `Đáp án tham khảo: ${correctAnswer}` : ""}
Câu trả lời của học viên: ${userAnswer}

Hãy chấm bài theo format JSON.`;

  try {
    const raw = await generateContent(`${systemPrompt}\n\n${userPrompt}`);

    // Strip markdown code fences nếu model vẫn trả về
    const cleaned = raw
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    const parsed = JSON.parse(cleaned) as Omit<AiGradeResult, "isCorrect">;

    return {
      ...parsed,
      isCorrect: parsed.isAcceptable && parsed.score >= 70,
    };
  } catch {
    // Fallback nếu AI không trả về JSON hợp lệ
    return {
      isCorrect: false,
      isAcceptable: false,
      score: 0,
      feedbackVi:
        "Không thể chấm tự động lúc này. Vui lòng thử lại sau.",
      suggestedAnswer: correctAnswer ?? "",
    };
  }
}
