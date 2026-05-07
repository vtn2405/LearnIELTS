# PHASE 5 — IELTS Grammar Companion

> Build Plan v5.0 | Tiền đề: Phase 4 (Auth Clerk ✅) hoàn thành

---

## 🏗️ Stack thực tế

| Layer         | Tech                                               |
| ------------- | -------------------------------------------------- |
| Auth          | **Clerk** — `auth().userId()`, `useUserId()` hook  |
| Database      | **Prisma** (PostgreSQL) — không dùng Supabase      |
| AI Transcribe | **Groq Whisper** — miễn phí, không cần credit card |
| AI Feedback   | **Gemini Flash** qua Antigravity proxy             |
| Storage audio | **Vercel Blob** hoặc local `/tmp` (xem ghi chú)    |

> ⚠️ **Không dùng Supabase** — DB là Prisma, Auth là Clerk.
> Bỏ toàn bộ phần Supabase Schema / RLS / Storage bucket trong plan cũ.

---

## 🔄 Flow học tập — 5 bước/unit (không reload trang)

| Bước | Màn hình       | Thời gian | AI cần?          |
| ---- | -------------- | --------- | ---------------- |
| 1    | Theory         | ~3 phút   | ❌               |
| 2    | Practice       | ~5 phút   | ❌               |
| 3    | Apply Writing  | ~3 phút   | ✅ Gemini Flash  |
| 4    | Speaking Drill | ~2 phút   | ✅ Groq + Gemini |
| 5    | Completion     | ~30 giây  | ❌               |

---

## 🗄️ Prisma Schema — thêm vào schema.prisma

```prisma
// Kết quả bài tập
model ExerciseResult {
  id              String   @id @default(cuid())
  clerkId         String
  unitId          String
  exerciseType    String   // 'identify' | 'transform' | 'produce'
  skill           String   // 'writing' | 'speaking' | 'both'
  bandEstimate    Float?
  accuracyPercent Int?
  rawInput        String?
  aiFeedback      Json?
  createdAt       DateTime @default(now())

  @@index([clerkId, unitId])
  @@index([clerkId, createdAt(sort: Desc)])
}

// Phiên luyện speaking
model SpeakingSession {
  id              String   @id @default(cuid())
  clerkId         String
  unitId          String
  prompt          String
  transcript      String?
  audioPath       String?
  bandEstimate    Float?
  aiFeedback      Json?
  durationSeconds Int?
  createdAt       DateTime @default(now())
}

// Streak người dùng
model UserStreak {
  clerkId        String   @id
  currentStreak  Int      @default(0)
  longestStreak  Int      @default(0)
  lastActiveDate DateTime?
}

// Progress theo từng unit
model UnitProgress {
  id              String    @id @default(cuid())
  clerkId         String
  unitId          String
  bestBand        Float?
  attemptCount    Int       @default(0)
  lastAttemptedAt DateTime?
  completedAt     DateTime?
  xpEarned        Int       @default(0)

  @@unique([clerkId, unitId])
}
```

Sau khi thêm → chạy:

```bash
npx prisma migrate dev --name add_phase5_tables
```

---

## 📦 Lộ trình 3 giai đoạn

### Phase 5A — Foundation (~1 tuần)

> Mục tiêu: App chạy end-to-end với 1 unit Present Simple thật

- [ ] **5A-1** Prisma migration: 4 bảng mới ở trên
- [ ] **5A-2** Seed unit 1: `src/lib/content/units/unit-1-simple-present.ts`
- [ ] **5A-3** API route: `src/app/api/transcribe/route.ts` (Groq Whisper)
  - Auth: `auth().userId()` từ Clerk
- [ ] **5A-4** API route: `src/app/api/ai/speaking-drill-feedback/route.ts`
- [ ] **5A-5** API route: `src/app/api/ai/writing-mini-feedback/route.ts`
- [ ] **5A-6** API route: `src/app/api/progress/update/route.ts`
- [ ] **5A-7** Component: `src/components/speaking/RecorderWidget.tsx`
- [ ] **5A-8** Page: `src/app/unit/[unitId]/page.tsx` (5-step flow)

**✅ Check 5A:** Login Clerk → `/unit/unit-1-simple-present` → đi đủ 5 bước → data lưu vào Prisma DB

---

### Phase 5B — Content + Dashboard (~1 tuần)

> Mục tiêu: Đủ content dùng hằng ngày, Dashboard thật

- [ ] **5B-1** Generate 15 units còn lại bằng Gemini (~3 phút/unit, dùng prompt bên dưới)
- [ ] **5B-2** Dashboard: `src/app/dashboard/page.tsx`
  - StreakCounter, BandBadge, BandHistoryChart (Recharts), ProgressRing, ContinueLearning
  - Data fetch từ Prisma: `UserStreak`, `UnitProgress`, `ExerciseResult`
- [ ] **5B-3** Unit lock/unlock: `src/lib/content/unitAccess.ts`
  - `unit.band_min <= userBand + 0.5` → accessible; nếu không → mờ 40% + icon lock
- [ ] **5B-4** `ensureUserExists()` đã có từ Phase 4 — tái dùng cho các route mới

**✅ Check 5B:** ≥8 units, Dashboard hiển thị streak + band chart thật

---

### Phase 5C — Polish (~3–5 ngày)

> Mục tiêu: Production-ready, mobile tốt

- [ ] **5C-1** Speaking Lab: `src/app/speaking-lab/[unitId]/page.tsx` (record 60s, full feedback)
- [ ] **5C-2** Mobile fix: iOS Safari HTTPS + mic, nút Record ≥80×80px, accordion mobile
- [ ] **5C-3** Rate limiting: 10 speaking req/ngày/user + cache feedback 24h

**✅ Check 5C:** iPhone Safari + Chrome Android pass

---

## 🔌 Environment Variables (.env.local)

```env
# Clerk (từ Phase 4 — đã có)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Prisma (từ Phase 1 — đã có)
DATABASE_URL=postgresql://...

# Groq Whisper — console.groq.com (miễn phí)
GROQ_API_KEY=gsk_...

# Antigravity Proxy — Gemini Flash
ANTIGRAVITY_API_KEY=...
ANTIGRAVITY_BASE_URL=https://...
```

---

## 🤖 API Routes — Auth pattern với Clerk

```ts
// Pattern chuẩn cho tất cả route trong Phase 5
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = auth(); // Clerk userId
  if (!userId) return new Response("Unauthorized", { status: 401 });

  await ensureUserExists(userId); // tái dùng từ Phase 4
  // ... logic
}
```

### /api/transcribe (Groq Whisper)

```ts
// POST: FormData { audio: Blob, unit_id: string }
// Model: whisper-large-v3, language: 'en', response_format: verbose_json
// Groq free: 7,200s audio/ngày · 20 req/phút · $0
// Return: { transcript: string, duration: number }
// Errors: 401 | 413 (>6MB) | 422 | 429
```

### /api/ai/speaking-drill-feedback (Gemini Flash)

```ts
// POST: { transcript, unitId, targetBand, grammarTargets }
// Return JSON:
{
  band_estimate: 5.5,
  grammar_ok: true,
  one_improvement: "Thêm frequency adverb trước động từ chính",
  upgraded_sentence: "I generally wake up at 6:30...",
  encouragement: "Câu phát âm rõ ràng, cấu trúc đúng hướng!"
}
```

### /api/ai/writing-mini-feedback (Gemini Flash)

```ts
// POST: { text, unitId, targetBand, grammarTargets }
// Return JSON:
{
  band_estimate: 6.0,
  grammar_used_correctly: true,
  errors: [{ original, corrected, why_vi }],
  upgraded_sentence: "...",
  encouragement: "..."
}
```

### /api/progress/update — Streak logic

```ts
// POST: { unitId, bandEstimate, xpEarned, completedAt }
// userId lấy từ auth() Clerk, không nhận từ body

// Streak logic (UserStreak table):
// lastActiveDate = hôm qua  → currentStreak + 1
// lastActiveDate = hôm nay  → giữ nguyên
// lastActiveDate < hôm qua  → reset về 1

// Upsert UnitProgress: best_band, attempt_count, xp_earned
```

---

## 📝 TypeScript Types — src/lib/content/types.ts

```ts
export interface GrammarUnit {
  id: string;
  chapter: number;
  title: string; // 'Simple Present'
  subtitle: string; // 'Thì hiện tại đơn'
  band_min: number;
  band_target: number;
  theory: TheorySection;
  exercises: ExerciseSet;
  apply: ApplySection;
  completion: CompletionMeta;
}

export interface SpeakingContrastExample {
  wrong: string; // 'I go gym everyday'
  correct: string; // 'I usually go to the gym every day'
  tip_vi: string;
  band_impact: string;
}

export interface Exercise {
  id: string;
  type: "multiple_choice" | "find_error" | "reorder";
  question: string;
  options?: string[];
  correct_answer: string | string[];
  feedback_correct: string;
  feedback_wrong: string;
  ielts_tip: string;
  skill: "speaking" | "writing" | "both";
}

export interface WritingMiniTask {
  prompt: string;
  placeholder: string;
  grammar_must_use: string[];
  word_limit: 30;
  model_answer: string;
  model_band: number;
}

export interface SpeakingDrill {
  prompt: string;
  time_limit: 30;
  grammar_targets: string[];
  model_answer: string;
  model_band: number;
}

export interface CompletionMeta {
  xp_reward: 50;
  badge?: { id: string; name: string; icon: string; description_vi: string };
  next_unit_id: string;
  next_unit_title: string;
  next_unit_connection: string;
}
```

---

## 🧠 Gemini Prompt — Generate Unit Content

> Điền 3 biến: `[GRAMMAR POINT]`, `[CHAPTER]`, `[TARGET BAND]`
> Quy trình: Copy → Paste Gemini → Fill biến → Lấy JSON → Save file → Review (~3 phút/unit)
