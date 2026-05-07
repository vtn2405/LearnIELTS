import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY ?? "",
  baseURL:
    process.env.ANTIGRAVITY_BASE_URL ??
    "https://platform.beeknoee.com/api/v1",
});

const MODEL = "deepseek/deepseek-chat-v3.1";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { original, userAttempt, correctAnswer } = await req.json();

    if (!original || !userAttempt || !correctAnswer) {
      return NextResponse.json(
        { error: "Missing fields: original, userAttempt, correctAnswer" },
        { status: 400 },
      );
    }

    const prompt = `You are an IELTS grammar coach. A student is practising correcting a grammar error.

Original (wrong): "${original}"
Expected correction: "${correctAnswer}"
Student's attempt: "${userAttempt}"

Decide if the student's attempt is correct. It is correct if it conveys the same fix as the expected correction, even with minor wording differences.
Respond with valid JSON only, no markdown:
{"ok": true} if correct, or {"ok": false, "hint": "<short hint in Vietnamese, max 20 words>"} if wrong.`;

    const completion = await ai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("[check-correction]", err);
    return NextResponse.json(
      { ok: false, hint: "Lỗi máy chủ, thử lại sau." },
      { status: 500 },
    );
  }
}
