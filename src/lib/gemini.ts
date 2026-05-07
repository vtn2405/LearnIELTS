/**
 * ⚠️  DEAD CODE — No callers found (2026-05-04 audit).
 *
 * Issues that were present:
 *  a) `throw new Error("Missing GEMINI_API_KEY")` was at module scope →
 *     any import would crash the server on cold start if the env var is missing.
 *  b) Model name "gemini-3.0-flash" does not exist in the Gemini public API.
 *
 * All active API routes use the OpenAI-compat proxy (openai SDK) instead.
 * If this file is ever needed again, move the throw inside the function body
 * and use "gemini-2.0-flash-exp" as the model name.
 */

// Bare export keeps this file a valid TS module (required by the import in lib/gemini-grader.ts).
// Both files are dead code — no active routes use them.
export {};

// import { GoogleGenerativeAI } from "@google/generative-ai";
//
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const GEMINI_BASE_URL =
//   process.env.GEMINI_BASE_URL ??
//   "https://antigravity-manager-production-722d.up.railway.app/";
//
// if (!GEMINI_API_KEY) {
//   throw new Error("Missing required environment variable GEMINI_API_KEY");
// }
//
// const google = new GoogleGenerativeAI(GEMINI_API_KEY);
//
// export const geminiModel = google.getGenerativeModel(
//   { model: "gemini-2.0-flash-exp" },
//   { baseUrl: GEMINI_BASE_URL },
// );
//
// export async function generateContent(prompt: string): Promise<string> {
//   const result = await geminiModel.generateContent(prompt);
//   return result.response.text();
// }
