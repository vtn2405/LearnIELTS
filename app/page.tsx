import Link from "next/link";

// ── Right panel step ────────────────────────────────────────────────────────
type StepStatus = "active" | "waiting" | "locked";

function TodayStep({
  icon,
  title,
  subtitle,
  badge,
  badgeColor,
  action,
  isLast = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: "navy" | "slate" | "red";
  action?: React.ReactNode;
  isLast?: boolean;
}) {
  const badgeClass =
    badgeColor === "navy"
      ? "bg-[#1a3a5c] text-white"
      : badgeColor === "red"
        ? "bg-red-100 text-red-600"
        : "bg-slate-100 text-slate-500";

  return (
    <div className="flex gap-3">
      {/* Icon + connector */}
      <div className="flex flex-col items-center">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>
        {!isLast && (
          <div className="mt-1 w-px flex-1 bg-slate-200 min-h-[24px]" />
        )}
      </div>
      {/* Content */}
      <div className={`pb-4 flex-1 ${isLast ? "pb-0" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-semibold text-slate-800 leading-tight">
              {title}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400 leading-tight">
              {subtitle}
            </p>
          </div>
          <span
            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}
          >
            {badge}
          </span>
        </div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="flex h-full">
      {/* ── Center panel ── */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        {/* Welcome header */}
        <div className="mb-5">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Chào mừng trở lại, Nhung! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Bạn đang tiến rất gần đến mục tiêu Band 8.5 rồi.
          </p>
        </div>

        {/* ── Hero card: Today's topic ── */}
        <div
          id="today-topic-card"
          className="relative mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {/* AI badge */}
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0d9488"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-[11px] font-bold text-teal-700 tracking-wide">
              AI PHÂN TÍCH
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold leading-tight text-[#1a3a5c]">
                Chủ đề hôm nay:
                <br />
                <span className="text-teal-600">Present Simple</span>
              </h2>

              {/* Chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-600">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  10 phút
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-600">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="17 1 21 5 17 9" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <polyline points="7 23 3 19 7 15" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                  Speaking P1 / Writing T2
                </span>
              </div>

              {/* Description */}
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Bạn sẽ dùng thì này để mô tả thói quen, sự thật hiển nhiên và
                trả lời các câu hỏi về bản thân trong IELTS.
              </p>

              {/* CTA */}
              <Link
                href="/unit/unit-1-simple-present"
                id="today-start-btn"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1a3a5c] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#15304f] transition-colors"
              >
                Bắt đầu học
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Warning / insight box ── */}
        <div
          id="insight-box"
          className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-100">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-red-700">
                Bạn hay sai: Thiếu &#39;s&#39; (3 lần)
              </p>
              <p className="mt-0.5 text-[12px] text-red-500">
                Lưu ý chia động từ với ngôi thứ 3 số ít.
              </p>
            </div>
          </div>
          <Link
            href="/unit/unit-1-simple-present"
            id="insight-review-btn"
            className="shrink-0 text-[12px] font-semibold text-[#1a3a5c] hover:underline whitespace-nowrap"
          >
            Ôn lại Present Simple →
          </Link>
        </div>

        {/* ── Apply now / practice cards ── */}
        <div className="mb-1">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Áp dụng ngay</h3>
            <button
              id="view-all-apply-btn"
              className="text-[12px] font-medium text-slate-400 hover:text-slate-600"
            >
              Xem tất cả
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Writing card */}
            <div
              id="apply-writing-card"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2">
                  <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500">
                    ÁP DỤNG PRESENT SIMPLE
                  </span>
                </div>
                <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-teal-50 text-teal-700 border border-teal-100">
                  AI FEEDBACK
                </span>
              </div>
              <div className="mb-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <h4 className="text-[14px] font-bold text-slate-900">
                Task 2: Environment
              </h4>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500 flex-1">
                Luyện tập viết nghị luận xã hội về bảo vệ môi trường, sử dụng
                thì hiện tại đơn.
              </p>
              <Link
                href="/writing"
                id="apply-writing-btn"
                className="mt-3 text-[13px] font-semibold text-[#1a3a5c] hover:underline"
              >
                Viết ngay &rsaquo;
              </Link>
            </div>

            {/* Speaking card */}
            <div
              id="apply-speaking-card"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500">
                  ÁP DỤNG PRESENT SIMPLE
                </span>
                <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-orange-50 text-orange-600 border border-orange-100">
                  REAL-TIME AI
                </span>
              </div>
              <div className="mb-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <h4 className="text-[14px] font-bold text-slate-900">
                Part 2: Describe a book
              </h4>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500 flex-1">
                Mô phỏng 1-1 với giám khảo AI chuyên nghiệp. Phản hồi tức thì về
                phát âm.
              </p>
              <Link
                href="/speaking"
                id="apply-speaking-btn"
                className="mt-3 text-[13px] font-semibold text-[#1a3a5c] hover:underline"
              >
                Bắt đầu nói &rsaquo;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: Lộ trình hôm nay ── */}
      <div className="hidden xl:flex w-[270px] shrink-0 flex-col border-l border-slate-200 bg-white px-5 py-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-5 flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1a3a5c"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <h2 className="text-[14px] font-bold text-slate-800">
            Lộ trình hôm nay
          </h2>
        </div>

        {/* Steps */}
        <div>
          <TodayStep
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            }
            title="Grammar: Present Simple"
            subtitle="Lý thuyết cơ bản & Ví dụ"
            badge="Chưa học"
            badgeColor="navy"
            action={
              <Link
                href="/unit/unit-1-simple-present"
                id="roadmap-grammar-btn"
                className="inline-block rounded-lg bg-[#1a3a5c] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#15304f] transition-colors"
              >
                Học ngay
              </Link>
            }
          />
          <TodayStep
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            }
            title="Quiz: 5 câu"
            subtitle="Kiểm tra mức độ ghi nhớ"
            badge="Đang chờ"
            badgeColor="slate"
          />
          <TodayStep
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            title="Speaking Part 1"
            subtitle="Thực hành 2 câu hỏi"
            badge="Khóa"
            badgeColor="red"
            isLast
          />
        </div>

        {/* XP card */}
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⭐</span>
            <p className="text-[13px] font-bold text-slate-800">
              Hoàn thành để nhận XP
            </p>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Lộ trình được thiết kế tối ưu dựa trên mục tiêu Band 8.0 của bạn.
          </p>
        </div>

        {/* Motivational photo */}
        <div
          id="motivational-banner"
          className="mt-4 relative overflow-hidden rounded-2xl h-[130px] bg-gradient-to-br from-[#0d4f4a] to-[#1a3a5c] flex items-end"
        >
          {/* Desk illustration overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
              <rect x="10" y="50" width="80" height="8" rx="2" fill="white" />
              <rect
                x="20"
                y="20"
                width="30"
                height="30"
                rx="3"
                fill="white"
                opacity="0.7"
              />
              <rect
                x="55"
                y="30"
                width="20"
                height="20"
                rx="2"
                fill="white"
                opacity="0.5"
              />
              <rect x="25" y="58" width="4" height="15" rx="1" fill="white" />
              <rect x="71" y="58" width="4" height="15" rx="1" fill="white" />
            </svg>
          </div>
          <div className="relative z-10 px-4 py-3">
            <p className="text-[12px] font-bold text-white leading-snug">
              Keep focused. Your future self will thank you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
