# Phase 5B — Dashboard Rebuild Plan

> IELTS Grammar Companion | Build Plan v2.0
> Dựa trên giao diện mới (ảnh phải) — loại bỏ hoàn toàn giao diện cũ

---

## Tổng quan thay đổi so với UI cũ

| Xoá bỏ | Thay thế bằng |
|---|---|
| Card "AI Phân tích" + chủ đề hôm nay | Band Score History Chart |
| Card "Bạn hay sai" | Learning Progress (Grammar/Writing/Speaking) |
| Section "Áp dụng ngay" | ContinueLearning card (góc phải) |
| Sidebar: Target Band hardcode + streak hardcode | Sidebar: data thật từ DB |
| Sidebar: Academic Progress (Live Streak, Study Time, progress bar) | Sidebar: XP tổng + units hoàn thành |
| TopNav.tsx (component cũ, không dùng) | TopNavbar mới với streak + currentBand → targetBand |

---

## Migration cần làm TRƯỚC KHI code

```bash
# Thêm 2 field vào User model trong schema.prisma:
# targetBand  Float  @default(7.0)
# currentBand Float?

npx prisma migrate dev --name add_band_fields_to_user
```

Schema sau migration:
```prisma
model User {
  // ... các field hiện có giữ nguyên
  targetBand   Float   @default(7.0)
  currentBand  Float?
}
```

Cập nhật `lib/ensureUserExists.ts` — thêm `targetBand: 7.0` vào lúc create user.

---

## Cấu trúc file cần tạo / sửa

```
app/
└── dashboard/
    ├── layout.tsx          ← TẠO MỚI — wrap 3 cột
    └── page.tsx            ← SỬA — thêm query targetBand, writingCount, speakingCount

components/
├── dashboard/
│   ├── BandHistoryChart.tsx   ← TẠO MỚI — "use client" + Recharts
│   ├── ContinueLearning.tsx   ← TẠO MỚI — Server Component
│   ├── LearningProgress.tsx   ← TẠO MỚI — Server Component
│   └── TopNavbar.tsx          ← SỬA — thêm streak + band badges
├── Sidebar.tsx                ← SỬA — xoá mock data, thêm XP + units
└── AppShell.tsx               ← XEM — đảm bảo nhận layout dashboard

lib/
└── ensureUserExists.ts        ← SỬA — thêm targetBand default
```

---

## Bước 1 — Migration + ensureUserExists

**File:** `prisma/schema.prisma`

Thêm vào model `User`:
```prisma
targetBand   Float   @default(7.0)
currentBand  Float?
```

**File:** `lib/ensureUserExists.ts`

Trong phần `prisma.user.create`, thêm:
```ts
targetBand: 7.0,
// currentBand để null — user sẽ set qua onboarding (Phase 5B-3)
```

Chạy migration:
```bash
npx prisma migrate dev --name add_band_fields_to_user
```

---

## Bước 2 — dashboard/layout.tsx (TẠO MỚI)

Layout 2 cột: Sidebar (fixed trái) + main content (flex-1).
Không có right panel — giao diện mới đã bỏ right panel "Lộ trình hôm nay".

```tsx
// app/dashboard/layout.tsx
import { Sidebar } from "@/components/Sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { targetBand: true, currentBand: true, totalXp: true, name: true },
  });

  const streak = await prisma.userStreak.findUnique({
    where: { clerkId: userId },
    select: { currentStreak: true },
  });

  const unitsDone = await prisma.unitProgress.count({
    where: { clerkId: userId, completedAt: { not: null } },
  });

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <Sidebar
        targetBand={user?.targetBand ?? 7.0}
        currentStreak={streak?.currentStreak ?? 0}
        totalXp={user?.totalXp ?? 0}
        unitsDone={unitsDone}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
```

---

## Bước 3 — Sidebar.tsx (SỬA)

Xoá toàn bộ phần hardcode, nhận props từ layout.

**Props mới:**
```ts
interface SidebarProps {
  targetBand: number;
  currentStreak: number;
  totalXp: number;
  unitsDone: number;
}
```

**Thay phần "Target Band + Streak" hardcode:**
```tsx
// XOÁ:
<p className="text-[13px] font-bold text-[#1a3a5c]">Target Band: 8.5</p>
<p className="text-[11px] text-slate-400">12 Day Streak</p>

// THAY BẰNG:
<p className="text-[13px] font-bold text-[#1a3a5c]">
  Target Band: {targetBand.toFixed(1)}
</p>
<p className="text-[11px] text-slate-400 uppercase tracking-wider">
  {currentStreak} Day Streak
</p>
```

**Thay phần "Academic Progress" hardcode:**
```tsx
// XOÁ: Live Streak 14 Days, Study Time 45 mins, progress bar hardcode

// THAY BẰNG:
<div className="flex items-center justify-between">
  <span className="text-[12px] text-slate-500">Total XP</span>
  <span className="text-[12px] font-bold text-slate-800">
    {totalXp.toLocaleString()} XP
  </span>
</div>
<div className="flex items-center justify-between">
  <span className="text-[12px] text-slate-500">Units hoàn thành</span>
  <span className="text-[12px] font-bold text-slate-800">
    {unitsDone} / {getTotalUnits()}
  </span>
</div>
// Progress bar dựa trên unitsDone / getTotalUnits()
<div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
  <div
    className="h-full rounded-full bg-teal-500"
    style={{ width: `${Math.round((unitsDone / getTotalUnits()) * 100)}%` }}
  />
</div>
```

**Giữ nguyên:** navItems, Help Center, Logout button.

---

## Bước 4 — TopNavbar.tsx (SỬA)

Giao diện mới: topbar hiện `🔥 12 Ngày` + `HỆN TẠI 6.5 → MỤC TIÊU 7.5`

```tsx
// components/TopNavbar.tsx
// Nhận props từ dashboard/layout hoặc fetch riêng

interface TopNavbarProps {
  currentStreak: number;
  currentBand: number | null;
  targetBand: number;
}

// Phần badges bên phải:
<div className="flex items-center gap-2">
  {/* Streak badge */}
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200">
    <span className="text-orange-500 text-sm">🔥</span>
    <span className="text-[13px] font-semibold text-orange-700">
      {currentStreak} Ngày
    </span>
  </div>

  {/* Band badge */}
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200">
    <span className="text-[12px] text-slate-500">HỆN TẠI</span>
    <span className="text-[13px] font-bold text-teal-700">
      {currentBand?.toFixed(1) ?? "—"}
    </span>
    <span className="text-slate-400 text-xs">→</span>
    <span className="text-[12px] text-slate-500">MỤC TIÊU</span>
    <span className="text-[13px] font-bold text-teal-900">
      {targetBand.toFixed(1)}
    </span>
  </div>
</div>
```

---

## Bước 5 — dashboard/page.tsx (SỬA)

Thêm 3 query mới, xoá ProgressRing, xoá BandBadge, xoá StreakCounter.

```tsx
// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/lib/ensureUserExists";
import { BandHistoryChart } from "@/components/dashboard/BandHistoryChart";
import { LearningProgress } from "@/components/dashboard/LearningProgress";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";

function roundToNearestHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await ensureUserExists(userId);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [bandHistory, unitProgress, user, writingCount, speakingCount] =
    await Promise.all([
      prisma.exerciseResult.findMany({
        where: {
          clerkId: userId,
          createdAt: { gte: sevenDaysAgo },
          bandEstimate: { not: null },
        },
        orderBy: { createdAt: "asc" },
        select: { bandEstimate: true, createdAt: true, skill: true },
      }),
      prisma.unitProgress.findMany({
        where: { clerkId: userId },
        orderBy: { lastAttemptedAt: "desc" },
      }),
      prisma.user.findUnique({
        where: { clerkId: userId },
        select: { targetBand: true, currentBand: true, name: true },
      }),
      prisma.writingSubmission.count({
        where: { user: { clerkId: userId } },
      }),
      prisma.speakingSubmission.count({
        where: { user: { clerkId: userId } },
      }),
    ]);

  // currentBand: ưu tiên avg UnitProgress nếu có, fallback về user.currentBand
  const bestBands = unitProgress
    .map((p) => p.bestBand)
    .filter((b): b is number => b !== null)
    .sort((a, b) => b - a)
    .slice(0, 5);

  const currentBand =
    bestBands.length >= 3
      ? roundToNearestHalf(
          bestBands.reduce((s, b) => s + b, 0) / bestBands.length,
        )
      : (user?.currentBand ?? null);

  const continueUnit =
    unitProgress.find((p) => p.lastAttemptedAt && !p.completedAt) ?? null;

  // Grammar %: units hoàn thành / tổng units
  const totalUnits = unitProgress.length || 1;
  const completedUnits = unitProgress.filter((p) => p.completedAt).length;
  const grammarPct = Math.round((completedUnits / totalUnits) * 100);

  // Writing % và Speaking %: dựa trên số submission (tạm tính / max cố định)
  const WRITING_TOTAL = 20; // số prompt tối đa — điều chỉnh sau
  const SPEAKING_TOTAL = 20;
  const writingPct = Math.min(100, Math.round((writingCount / WRITING_TOTAL) * 100));
  const speakingPct = Math.min(100, Math.round((speakingCount / SPEAKING_TOTAL) * 100));

  const userName = user?.name?.split(" ")[0] ?? "bạn";
  const greeting = getGreeting(); // hàm lấy "buổi sáng/chiều/tối"

  return (
    <main className="flex-1 p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Chào {greeting}, {userName}!
        </h1>
        <p className="mt-1 text-slate-500 text-[14px]">
          Sẵn sàng cho bài thi IELTS hôm nay?
        </p>
      </div>

      {/* Band History Chart */}
      <BandHistoryChart
        data={bandHistory}
        targetBand={user?.targetBand ?? 7.0}
      />

      {/* Learning Progress + ContinueLearning */}
      <div className="mt-6 flex gap-6 items-start">
        <LearningProgress
          grammarPct={grammarPct}
          writingPct={writingPct}
          speakingPct={speakingPct}
        />
        {continueUnit && <ContinueLearning unit={continueUnit} />}
      </div>

      {/* Tiếp theo cho bạn */}
      <NextActions />
    </main>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "buổi sáng";
  if (hour < 18) return "buổi chiều";
  return "buổi tối";
}
```

---

## Bước 6 — BandHistoryChart.tsx (TẠO MỚI)

```tsx
// components/dashboard/BandHistoryChart.tsx
"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";

interface DataPoint {
  bandEstimate: number | null;
  createdAt: Date;
  skill: string;
}

interface Props {
  data: DataPoint[];
  targetBand: number;
}

export function BandHistoryChart({ data, targetBand }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-800 mb-1">Band Score History</h3>
        <p className="text-[13px] text-slate-400">
          Biểu đồ đánh giá năng lực trong 7 ngày qua
        </p>
        <div className="mt-6 h-48 flex items-center justify-center border border-dashed border-slate-200 rounded-xl">
          <p className="text-slate-400 text-[13px]">
            Chưa có dữ liệu — làm bài để xem tiến độ
          </p>
        </div>
      </div>
    );
  }

  // Group by ngày, lấy avg band mỗi ngày
  const grouped = groupByDay(data);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800">Band Score History</h3>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Biểu đồ đánh giá năng lực trong 7 ngày qua
          </p>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#1a3a5c] inline-block rounded" />
            Score
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-teal-500 inline-block rounded" />
            Target ({targetBand.toFixed(1)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-300 inline-block rounded border-dashed" />
            Baseline (6.5)
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={grouped} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} />
          <YAxis domain={[4, 9]} tick={{ fontSize: 12, fill: "#94a3b8" }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          {/* Target band line */}
          <ReferenceLine
            y={targetBand}
            stroke="#0d9488"
            strokeDasharray="4 4"
            label={{ value: targetBand.toFixed(1), position: "right", fontSize: 11, fill: "#0d9488" }}
          />
          {/* Baseline 6.5 */}
          <ReferenceLine
            y={6.5}
            stroke="#fca5a5"
            strokeDasharray="4 4"
            label={{ value: "6.5", position: "right", fontSize: 11, fill: "#fca5a5" }}
          />
          <Line
            type="monotone"
            dataKey="band"
            stroke="#1a3a5c"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#1a3a5c" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function groupByDay(data: DataPoint[]) {
  const map = new Map<string, number[]>();
  for (const d of data) {
    const day = new Date(d.createdAt).toLocaleDateString("vi-VN", { weekday: "short" });
    if (!map.has(day)) map.set(day, []);
    if (d.bandEstimate !== null) map.get(day)!.push(d.bandEstimate);
  }
  return Array.from(map.entries()).map(([day, bands]) => ({
    day,
    band: parseFloat((bands.reduce((a, b) => a + b, 0) / bands.length).toFixed(1)),
  }));
}
```

---

## Bước 7 — LearningProgress.tsx (TẠO MỚI)

```tsx
// components/dashboard/LearningProgress.tsx
// Server Component — không cần "use client"

interface Props {
  grammarPct: number;
  writingPct: number;
  speakingPct: number;
}

const modules = [
  {
    key: "grammar",
    label: "Grammar",
    icon: "📖", // thay bằng SVG nếu muốn
    color: "bg-teal-500",
    iconBg: "bg-teal-50",
  },
  {
    key: "writing",
    label: "Writing",
    icon: "✍️",
    color: "bg-blue-500",
    iconBg: "bg-blue-50",
  },
  {
    key: "speaking",
    label: "Speaking",
    icon: "🎤",
    color: "bg-orange-400",
    iconBg: "bg-orange-50",
  },
];

export function LearningProgress({ grammarPct, writingPct, speakingPct }: Props) {
  const pcts: Record<string, number> = {
    grammar: grammarPct,
    writing: writingPct,
    speaking: speakingPct,
  };

  return (
    <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="font-semibold text-slate-800 mb-5">Learning Progress</h3>
      <div className="space-y-5">
        {modules.map((mod) => (
          <div key={mod.key} className="flex items-center gap-4">
            <div className={`w-9 h-9 rounded-lg ${mod.iconBg} flex items-center justify-center text-base shrink-0`}>
              {mod.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1.5">
                <span className="text-[13px] font-medium text-slate-700">
                  {mod.label}
                </span>
                <span className="text-[13px] font-semibold text-slate-800">
                  {pcts[mod.key]}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${mod.color} transition-all duration-500`}
                  style={{ width: `${pcts[mod.key]}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Bước 8 — ContinueLearning.tsx (TẠO MỚI)

```tsx
// components/dashboard/ContinueLearning.tsx
import Link from "next/link";
import type { UnitProgress } from "@prisma/client";
import { getUnitMeta } from "@/lib/content/unitsMetadata";

interface Props {
  unit: UnitProgress;
}

export function ContinueLearning({ unit }: Props) {
  const meta = getUnitMeta(unit.unitId);
  const title = meta?.title ?? unit.unitId;
  const pct = unit.bestBand
    ? Math.round(((unit.bestBand - 4) / 5) * 100)
    : 0;

  return (
    <div className="w-[280px] shrink-0 rounded-2xl bg-[#1a3a5c] p-6 text-white">
      <p className="text-[11px] font-semibold text-teal-300 uppercase tracking-widest mb-2">
        Đang học dở
      </p>
      <h3 className="text-xl font-bold leading-snug mb-1">{title}</h3>
      <p className="text-[13px] text-slate-300 mb-4">
        {unit.attemptCount} lần thử
        {unit.bestBand ? ` · Best: Band ${unit.bestBand.toFixed(1)}` : ""}
      </p>

      {/* Mini progress bar */}
      <div className="h-1 w-full rounded-full bg-white/20 mb-5 overflow-hidden">
        <div
          className="h-full rounded-full bg-teal-400"
          style={{ width: `${pct}%` }}
        />
      </div>

      <Link
        href={`/unit/${unit.unitId}`}
        className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2 text-[13px] font-semibold text-white hover:bg-white/10 transition-colors"
      >
        Tiếp tục học →
      </Link>
    </div>
  );
}
```

---

## Bước 9 — NextActions component (TẠO MỚI)

Section "Tiếp theo cho bạn" — 3 card shortcuts, Mock Test disabled tạm.

```tsx
// components/dashboard/NextActions.tsx
import Link from "next/link";

const actions = [
  {
    label: "Quick Review",
    desc: "5-min flashcards",
    href: "/grammar", // tạm link về grammar
    icon: "✦",
    disabled: false,
  },
  {
    label: "Mock Test",
    desc: "Full simulation",
    href: "#",
    icon: "≡",
    disabled: true, // coming soon
    badge: "Sắp ra mắt",
  },
  {
    label: "Academic Vocabulary",
    desc: "Collocations & từ học thuật",
    href: "/grammar",
    icon: "◎",
    disabled: false,
  },
];

export function NextActions() {
  return (
    <div className="mt-8">
      <h3 className="font-semibold text-slate-800 mb-4">Tiếp theo cho bạn</h3>
      <div className="grid grid-cols-3 gap-4">
        {actions.map((action) => (
          <div key={action.label} className="relative">
            {action.badge && (
              <span className="absolute -top-2 right-3 text-[10px] font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                {action.badge}
              </span>
            )}
            <Link
              href={action.disabled ? "#" : action.href}
              className={`block rounded-2xl border border-slate-200 bg-white p-5 transition-colors ${
                action.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-slate-300 hover:shadow-sm"
              }`}
              onClick={(e) => action.disabled && e.preventDefault()}
            >
              <span className="text-xl mb-3 block">{action.icon}</span>
              <p className="font-semibold text-slate-800 text-[14px]">{action.label}</p>
              <p className="text-[12px] text-slate-400 mt-0.5">{action.desc}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Bước 10 — Cài recharts (nếu chưa có)

```bash
npm install recharts
```

---

## Checklist hoàn thành 5B

- [ ] Migration `add_band_fields_to_user` đã chạy
- [ ] `ensureUserExists.ts` đã thêm `targetBand: 7.0`
- [ ] `app/dashboard/layout.tsx` tạo xong, fetch đúng 3 query
- [ ] `Sidebar.tsx` nhận props, không còn hardcode nào
- [ ] `TopNavbar.tsx` hiện streak + currentBand → targetBand từ props
- [ ] `dashboard/page.tsx` fetch đủ 5 query, không còn StreakCounter/BandBadge/ProgressRing
- [ ] `BandHistoryChart.tsx` có TARGET line + BASELINE 6.5 + empty state
- [ ] `LearningProgress.tsx` hiện 3 module với % thật
- [ ] `ContinueLearning.tsx` ẩn khi null, hiện đúng unit
- [ ] `NextActions.tsx` Mock Test disabled, 2 card còn lại link thật
- [ ] recharts đã cài
- [ ] Không còn file `TopNav.tsx` cũ được dùng ở dashboard

---

## Sau 5B — Bước tiếp theo

- **5B-3** — Onboarding flow (`/onboarding`): hỏi currentBand + targetBand lần đầu đăng nhập
- **5B-4** — Settings page (`/settings`): đổi targetBand + currentBand bất cứ lúc nào
- **5C** — Auto-update currentBand từ UnitProgress sau ≥3 bài thực tế
- **5D** — Quick Review UI (`/review`) + Academic Vocabulary (`/vocabulary`)
- **5E** — Mock Test (`/mock-test`)
