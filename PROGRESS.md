## Phase 3 — Grammar Lesson UI & API Integration

**Status: ✅ COMPLETED**
**Date: 12/04/2026**

### Đã hoàn thành:

- ✅ 5 API endpoints (fetch lesson, submit exercise,
  complete lesson, spaced repetition, AI grading)
- ✅ lib/spaced-repetition.ts (SM-2 algorithm)
- ✅ lib/gemini-grader.ts (AI feedback)
- ✅ Lesson content "Present Simple" generated từ PDF
  (trang 254–266 của giai-thich-ngu-phap.pdf)
- ✅ Update lesson vào DB qua Prisma
- ✅ LessonClient.tsx — kết nối UI với API
- ✅ Layout redesign: numbered sections (01→05),
  bảng Sentence Construction, Common Pitfalls cards,
  IELTS Strategy, responsive mobile
- ✅ XP floating animation (framer-motion)
- ✅ Completion banner với AI lộ trình gợi ý
- ✅ Edge cases: duplicate XP guard, mobile layout,
  submit sai nhiều lần không crash
- ✅ Spaced repetition: UserLessonProgress
  tạo đúng với nextReviewDate

### Quyết định kỹ thuật:

- Dùng Option A (field hiện có) thay vì migration mới
  → sẽ gom schema changes vào 1 migration ở Phase 4
- AI feedback tính từ client (mistakeTags)
  thay vì thêm field vào API response

## Phase 4 — Authentication với Clerk

**Status: ✅ COMPLETED**
**Date: 12/04/2026**

### Bước 1 — Cài đặt & Config (✅ HOÀN THÀNH)

- ✅ Cài đặt: `npm install @clerk/nextjs --legacy-peer-deps`
  (dùng --legacy-peer-deps vì Clerk yêu cầu Next.js 15+, project dùng 14.2.5)
- ✅ Tạo .env.local với Clerk keys:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`

### Bước 2 — Wrap app + Middleware (✅ HOÀN THÀNH)

- ✅ Wrap app với `<ClerkProvider>` trong `app/layout.tsx`
- ✅ Tạo `middleware.ts` với protected routes:
  - `/grammar/*`, `/writing/*`, `/speaking/*`, `/api/*`
  - Sử dụng `createRouteMatcher` và `auth().protect()`

### Bước 3 — Protected routes & auth guards (✅ HOÀN THÀNH)

- ✅ Tạo `AuthGuard` component với loading state & redirect
- ✅ Tạo `useUserId` hook để get user ID từ Clerk
- ✅ Update grammar page: tách thành client component + auth guard
- ✅ Update `/api/grammar/chapters` để sử dụng `auth().userId()`
- ✅ Tạo sign-in/sign-up pages với Clerk components
- ✅ Update TopNavbar: SignInButton cho guest, UserButton cho authenticated users

### Bước 4 — User session integration (✅ HOÀN THÀNH)

- ✅ Tất cả API routes sử dụng `auth().userId()` thay vì TEST_USER_ID
- ✅ Pages sử dụng `useUserId()` hook từ Clerk
- ✅ Authentication flow hoàn chỉnh: sign-in → protected routes → user data

### Bước 5 — Auto-create User records (✅ HOÀN THÀNH)

- ✅ Thêm `clerkId` field vào User model (unique, required)
- ✅ Tạo migration: `add_clerk_id_to_user`
- ✅ Tạo `ensureUserExists()` utility function
- ✅ Update tất cả API routes để auto-create user khi lần đầu hit:
  - `/api/grammar/chapters`
  - `/api/grammar/lessons/[lessonId]`
  - `/api/grammar/exercise/submit`
  - `/api/grammar/lesson/complete`
- ✅ User record tự động tạo với email & name từ Clerk

### Quyết định kỹ thuật:

- Dùng ensureUserExists() trong API thay vì
  Clerk webhook → đơn giản hơn, đủ dùng cho
  scale hiện tại

# Phase 5B-2 — Dashboard Implementation Guide

> IELTS Grammar Companion | Build Plan v5.0 | Tiếp nối Phase 5A ✅

---

## 🎯 Mục tiêu

Build trang `src/app/dashboard/page.tsx` với đầy đủ 5 component:

| Component          | Data Source                                   | Mô tả                     |
| ------------------ | --------------------------------------------- | ------------------------- |
| `StreakCounter`    | `UserStreak`                                  | Ngọn lửa + số ngày streak |
| `BandBadge`        | `UnitProgress` (avg bestBand)                 | Màu theo band hiện tại    |
| `BandHistoryChart` | `ExerciseResult` (7 ngày)                     | Recharts LineChart        |
| `ProgressRing`     | `UnitProgress` (per chapter)                  | SVG ring % hoàn thành     |
| `ContinueLearning` | `UnitProgress` (lastAttempted, not completed) | Unit đang học dở          |

---

## 📂 Cấu trúc file cần tạo

```
src/
├── app/
│   └── dashboard/
│       └── page.tsx               ← Server Component (fetch data từ Prisma)
├── components/
│   └── dashboard/
│       ├── StreakCounter.tsx
│       ├── BandBadge.tsx
│       ├── BandHistoryChart.tsx   ← Client Component ("use client")
│       ├── ProgressRing.tsx       ← Client Component ("use client")
│       └── ContinueLearning.tsx
```

---

## 🗄️ Data Fetching — `dashboard/page.tsx`

```tsx
// src/app/dashboard/page.tsx
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/lib/ensureUserExists";
import StreakCounter from "@/components/dashboard/StreakCounter";
import BandBadge from "@/components/dashboard/BandBadge";
import BandHistoryChart from "@/components/dashboard/BandHistoryChart";
import ProgressRing from "@/components/dashboard/ProgressRing";
import ContinueLearning from "@/components/dashboard/ContinueLearning";

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  await ensureUserExists(userId);

  // 1. Streak
  const streak = await prisma.userStreak.findUnique({
    where: { clerkId: userId },
  });

  // 2. Band history — 7 ngày gần nhất
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const bandHistory = await prisma.exerciseResult.findMany({
    where: {
      clerkId: userId,
      createdAt: { gte: sevenDaysAgo },
      bandEstimate: { not: null },
    },
    orderBy: { createdAt: "asc" },
    select: { bandEstimate: true, createdAt: true, skill: true },
  });

  // 3. Unit progress — tất cả
  const unitProgress = await prisma.unitProgress.findMany({
    where: { clerkId: userId },
    orderBy: { lastAttemptedAt: "desc" },
  });

  // 4. Best band hiện tại (avg of top 5 bestBand)
  const bestBands = unitProgress
    .map((u) => u.bestBand)
    .filter((b): b is number => b !== null)
    .sort((a, b) => b - a)
    .slice(0, 5);
  const currentBand =
    bestBands.length > 0
      ? Math.round(
          (bestBands.reduce((s, b) => s + b, 0) / bestBands.length) * 2,
        ) / 2
      : null;

  // 5. Unit đang học dở
  const continueUnit =
    unitProgress.find((u) => u.lastAttemptedAt && !u.completedAt) ?? null;

  return (
    <main className="dashboard-layout">
      <div className="dashboard-header">
        <StreakCounter streak={streak} />
        <BandBadge band={currentBand} />
      </div>

      <BandHistoryChart data={bandHistory} />

      <div className="dashboard-bottom">
        <ProgressRing unitProgress={unitProgress} />
        {continueUnit && <ContinueLearning unit={continueUnit} />}
      </div>
    </main>
  );
}
```

---

## 🔥 Component 1 — `StreakCounter.tsx`

```tsx
// src/components/dashboard/StreakCounter.tsx
import type { UserStreak } from "@prisma/client";

interface Props {
  streak: UserStreak | null;
}

export default function StreakCounter({ streak }: Props) {
  const current = streak?.currentStreak ?? 0;
  const longest = streak?.longestStreak ?? 0;

  return (
    <div className="streak-card">
      <span className="streak-fire" aria-hidden="true">
        🔥
      </span>
      <div className="streak-info">
        <span className="streak-number">{current}</span>
        <span className="streak-label">ngày liên tiếp</span>
      </div>
      {longest > 0 && (
        <span className="streak-best">Kỷ lục: {longest} ngày</span>
      )}
    </div>
  );
}
```

---

## 🎖️ Component 2 — `BandBadge.tsx`

```tsx
// src/components/dashboard/BandBadge.tsx

interface Props {
  band: number | null;
}

// Màu theo band IELTS
function getBandColor(band: number): string {
  if (band >= 7.5) return "band-color-expert"; // teal/green
  if (band >= 6.5) return "band-color-upper"; // blue
  if (band >= 5.5) return "band-color-mid"; // amber
  if (band >= 4.5) return "band-color-lower"; // orange
  return "band-color-beginner"; // gray
}

function getBandLabel(band: number): string {
  if (band >= 7.5) return "Expert";
  if (band >= 6.5) return "Upper-Intermediate";
  if (band >= 5.5) return "Intermediate";
  if (band >= 4.5) return "Pre-Intermediate";
  return "Beginner";
}

export default function BandBadge({ band }: Props) {
  if (band === null) {
    return (
      <div className="band-badge band-color-empty">
        <span className="band-value">—</span>
        <span className="band-label">Chưa có dữ liệu</span>
      </div>
    );
  }

  return (
    <div className={`band-badge ${getBandColor(band)}`}>
      <span className="band-value">Band {band.toFixed(1)}</span>
      <span className="band-label">{getBandLabel(band)}</span>
    </div>
  );
}
```

**CSS classes cần thêm vào `globals.css`:**

```css
.band-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
}
.band-color-expert {
  background: #d1fae5;
  color: #065f46;
}
.band-color-upper {
  background: #dbeafe;
  color: #1e40af;
}
.band-color-mid {
  background: #fef3c7;
  color: #92400e;
}
.band-color-lower {
  background: #ffedd5;
  color: #9a3412;
}
.band-color-beginner {
  background: #f3f4f6;
  color: #374151;
}
.band-color-empty {
  background: #f9fafb;
  color: #9ca3af;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .band-color-expert {
    background: #064e3b;
    color: #6ee7b7;
  }
  .band-color-upper {
    background: #1e3a5f;
    color: #93c5fd;
  }
  .band-color-mid {
    background: #451a03;
    color: #fcd34d;
  }
  .band-color-lower {
    background: #431407;
    color: #fdba74;
  }
  .band-color-beginner {
    background: #1f2937;
    color: #d1d5db;
  }
}
```

---

## 📈 Component 3 — `BandHistoryChart.tsx` (Client Component)

```tsx
"use client";
// src/components/dashboard/BandHistoryChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface BandDataPoint {
  bandEstimate: number | null;
  createdAt: Date;
  skill: string;
}

interface Props {
  data: BandDataPoint[];
}

function formatChartData(raw: BandDataPoint[]) {
  // Group by date, lấy avg bandEstimate mỗi ngày
  const grouped: Record<string, number[]> = {};
  raw.forEach((item) => {
    if (!item.bandEstimate) return;
    const day = new Date(item.createdAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(item.bandEstimate);
  });

  return Object.entries(grouped).map(([date, bands]) => ({
    date,
    band: Math.round((bands.reduce((s, b) => s + b, 0) / bands.length) * 2) / 2,
  }));
}

export default function BandHistoryChart({ data }: Props) {
  const chartData = formatChartData(data);

  if (chartData.length === 0) {
    return (
      <div className="chart-empty">
        <p>Chưa có dữ liệu. Hãy hoàn thành một bài tập để xem biểu đồ band!</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h2 className="chart-title">Band Score — 7 ngày gần nhất</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border, #e5e7eb)"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--color-text-muted, #6b7280)" }}
          />
          <YAxis
            domain={[4, 9]}
            ticks={[4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9]}
            tick={{ fontSize: 11, fill: "var(--color-text-muted, #6b7280)" }}
          />
          <Tooltip
            formatter={(value: number) => [`Band ${value}`, "Band Score"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid var(--color-border, #e5e7eb)",
              fontSize: "13px",
            }}
          />
          {/* Target line ở band 6.5 */}
          <ReferenceLine
            y={6.5}
            stroke="var(--color-primary, #01696f)"
            strokeDasharray="4 4"
            label={{ value: "Target 6.5", position: "right", fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="band"
            stroke="var(--color-primary, #01696f)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "var(--color-primary, #01696f)" }}
            activeDot={{ r: 6 }}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## ⭕ Component 4 — `ProgressRing.tsx` (Client Component)

```tsx
"use client";
// src/components/dashboard/ProgressRing.tsx
// Hiển thị progress per chapter dưới dạng SVG ring

import type { UnitProgress } from "@prisma/client";
import { UNITS_BY_CHAPTER } from "@/lib/content/unitsMetadata"; // map chapterId → unitIds[]

interface Props {
  unitProgress: UnitProgress[];
}

interface RingProps {
  percent: number; // 0–100
  label: string;
  sublabel: string;
  color: string;
  size?: number;
}

function Ring({ percent, label, sublabel, color, size = 72 }: RingProps) {
  const r = (size - 10) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (percent / 100) * circumference;

  return (
    <div className="ring-item">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border, #e5e7eb)"
          strokeWidth={8}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={circumference / 4} /* start from top */
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        {/* Label */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.35em"
          fontSize="14"
          fontWeight="700"
          fill="currentColor"
        >
          {percent}%
        </text>
      </svg>
      <span className="ring-label">{label}</span>
      <span className="ring-sublabel">{sublabel}</span>
    </div>
  );
}

const CHAPTER_COLORS = ["#01696f", "#437a22", "#006494", "#7a39bb", "#da7101"];

export default function ProgressRing({ unitProgress }: Props) {
  const completedSet = new Set(
    unitProgress.filter((u) => u.completedAt).map((u) => u.unitId),
  );

  const chapters = Object.entries(UNITS_BY_CHAPTER).map(
    ([chapterId, unitIds], idx) => {
      const done = unitIds.filter((id) => completedSet.has(id)).length;
      const total = unitIds.length;
      return {
        id: chapterId,
        label: `Ch.${Number(chapterId)}`,
        sublabel: `${done}/${total}`,
        percent: total > 0 ? Math.round((done / total) * 100) : 0,
        color: CHAPTER_COLORS[idx % CHAPTER_COLORS.length],
      };
    },
  );

  return (
    <div className="progress-ring-section">
      <h2 className="section-title">Tiến độ theo chương</h2>
      <div className="rings-row">
        {chapters.map((ch) => (
          <Ring
            key={ch.id}
            percent={ch.percent}
            label={ch.label}
            sublabel={ch.sublabel}
            color={ch.color}
          />
        ))}
      </div>
    </div>
  );
}
```

**Cần tạo thêm `src/lib/content/unitsMetadata.ts`:**

```ts
// src/lib/content/unitsMetadata.ts
// Map chapter → danh sách unitId
// Điền theo 16 units đã seed ở Phase 5A/5B-1

export const UNITS_BY_CHAPTER: Record<string, string[]> = {
  "1": [
    "unit-1-simple-present",
    "unit-2-present-continuous",
    "unit-3-present-perfect",
  ],
  "2": ["unit-4-simple-past", "unit-5-past-continuous", "unit-6-past-perfect"],
  "3": [
    "unit-7-simple-future",
    "unit-8-future-continuous",
    "unit-9-conditionals",
  ],
  "4": [
    "unit-10-passive-voice",
    "unit-11-reported-speech",
    "unit-12-modal-verbs",
  ],
  "5": [
    "unit-13-relative-clauses",
    "unit-14-gerunds-infinitives",
    "unit-15-articles",
    "unit-16-prepositions",
  ],
};
```

> ⚠️ Điều chỉnh unitId cho khớp với file đã seed trong Phase 5B-1.

---

## ▶️ Component 5 — `ContinueLearning.tsx`

```tsx
// src/components/dashboard/ContinueLearning.tsx
import Link from "next/link";
import type { UnitProgress } from "@prisma/client";
import { getUnitMeta } from "@/lib/content/unitsMetadata";

interface Props {
  unit: UnitProgress;
}

export default function ContinueLearning({ unit }: Props) {
  const meta = getUnitMeta(unit.unitId);

  return (
    <div className="continue-card">
      <div className="continue-info">
        <span className="continue-tag">Tiếp tục học</span>
        <h3 className="continue-title">{meta?.title ?? unit.unitId}</h3>
        <p className="continue-sub">
          {unit.attemptCount} lần thử
          {unit.bestBand ? ` · Best: Band ${unit.bestBand.toFixed(1)}` : ""}
        </p>
      </div>
      <Link href={`/unit/${unit.unitId}`} className="continue-btn">
        Tiếp tục →
      </Link>
    </div>
  );
}
```

**Thêm helper vào `unitsMetadata.ts`:**

```ts
export function getUnitMeta(unitId: string) {
  for (const [chapter, units] of Object.entries(UNITS_BY_CHAPTER)) {
    if (units.includes(unitId)) {
      return {
        chapter,
        title: unitId.replace(/-/g, " ").replace(/unit \d+ /i, ""),
      };
    }
  }
  return null;
}
```

---

## 🎨 CSS — `globals.css` (thêm vào cuối)

```css
/* ===== DASHBOARD LAYOUT ===== */
.dashboard-layout {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* ===== STREAK ===== */
.streak-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-surface, #f9f8f5);
  border: 1px solid var(--color-border, #d4d1ca);
  border-radius: 12px;
  padding: 0.875rem 1.25rem;
}
.streak-fire {
  font-size: 1.75rem;
}
.streak-number {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1;
}
.streak-label {
  font-size: 0.8rem;
  color: var(--color-text-muted, #6b7280);
}
.streak-best {
  font-size: 0.75rem;
  color: var(--color-text-muted, #6b7280);
  margin-left: auto;
}

/* ===== CHART ===== */
.chart-card {
  background: var(--color-surface, #f9f8f5);
  border: 1px solid var(--color-border, #d4d1ca);
  border-radius: 12px;
  padding: 1.25rem;
}
.chart-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text, #28251d);
}
.chart-empty {
  text-align: center;
  padding: 2.5rem;
  color: var(--color-text-muted, #6b7280);
  font-size: 0.9rem;
  border: 1px dashed var(--color-border, #d4d1ca);
  border-radius: 12px;
}

/* ===== PROGRESS RINGS ===== */
.progress-ring-section {
  background: var(--color-surface, #f9f8f5);
  border: 1px solid var(--color-border, #d4d1ca);
  border-radius: 12px;
  padding: 1.25rem;
}
.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.rings-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.ring-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}
.ring-label {
  font-size: 0.8rem;
  font-weight: 600;
}
.ring-sublabel {
  font-size: 0.7rem;
  color: var(--color-text-muted, #6b7280);
}

/* ===== CONTINUE LEARNING ===== */
.continue-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface, #f9f8f5);
  border: 1px solid var(--color-border, #d4d1ca);
  border-radius: 12px;
  padding: 1.25rem;
  gap: 1rem;
}
.continue-tag {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary, #01696f);
}
.continue-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0.25rem 0;
  text-transform: capitalize;
}
.continue-sub {
  font-size: 0.8rem;
  color: var(--color-text-muted, #6b7280);
}
.continue-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.25rem;
  background: var(--color-primary, #01696f);
  color: #fff;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.18s;
}
.continue-btn:hover {
  background: var(--color-primary-hover, #0c4e54);
}

/* ===== DASHBOARD BOTTOM ROW ===== */
.dashboard-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 640px) {
  .dashboard-bottom {
    grid-template-columns: 1fr;
  }
  .rings-row {
    justify-content: center;
  }
}
```

---

## 📦 Dependencies cần cài

```bash
npm install recharts
npm install @types/recharts   # nếu cần
```

> Recharts đã declare types nội bộ từ v2.5+, không cần `@types/recharts`.

---

## ✅ Checklist 5B-2

- [ ] `dashboard/page.tsx` — Server Component, fetch đủ 4 queries từ Prisma
- [ ] `StreakCounter` — hiển thị currentStreak + longestStreak
- [ ] `BandBadge` — màu đúng theo band range
- [ ] `BandHistoryChart` — Recharts LineChart, group by day, ReferenceLine 6.5
- [ ] `ProgressRing` — SVG ring per chapter, % hoàn thành đúng
- [ ] `ContinueLearning` — link đúng `/unit/[unitId]`, ẩn khi null
- [ ] `unitsMetadata.ts` — map chapter → unitIds khớp với file đã seed
- [ ] CSS responsive — mobile 1 cột, desktop 2 cột bottom row
- [ ] Empty state cho chart (0 data) — không crash, hiển thị message
- [ ] Dark mode — CSS vars fallback đã có

---

## 🔭 Sau 5B-2 — Bước tiếp theo

Sau khi Dashboard chạy ổn:

- **5B-3** — Unit lock/unlock logic (`src/lib/content/unitAccess.ts`)
- **5B-4** — `ensureUserExists()` tái dùng cho routes mới
- → **Phase 5C** — Speaking Lab + Mobile polish + Rate limiting
