"use client";

export default function WritingPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Top level toggle bar */}
      <div className="flex items-center justify-end gap-3 border-b border-slate-200 bg-white px-6 py-2.5">
        <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5">
          <button
            id="toggle-basic-btn"
            className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition"
          >
            Cơ bản
          </button>
          <button
            id="toggle-advanced-btn"
            className="rounded-full px-4 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-800"
          >
            Nâng cao
          </button>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Score panel */}
        <div className="hidden lg:flex w-[200px] shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Dự đoán IELTS
          </p>

          {/* Score rows */}
          {[
            {
              label: "Task Response",
              score: 6.5,
              color: "bg-blue-500",
              pct: 65,
            },
            { label: "Coherence", score: 6.0, color: "bg-orange-400", pct: 60 },
            {
              label: "Lexical Resource",
              score: 7.0,
              color: "bg-red-500",
              pct: 70,
            },
            { label: "Grammar", score: 5.5, color: "bg-amber-500", pct: 55 },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-slate-600">{item.label}</p>
                <p className="text-xs font-bold text-slate-800">{item.score}</p>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className={`h-1.5 rounded-full ${item.color}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}

          {/* Overall Band */}
          <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
            <p className="text-[10px] text-slate-400">Overall Band (Est.)</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">6.5</p>
          </div>

          {/* Trend */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              ✦ XU HƯỚNG
            </p>
            <p className="text-xs leading-relaxed text-slate-600">
              Đang cải thiện 0.5 điểm so với bài trước nhờ từ vựng chuyên sâu.
            </p>
          </div>
        </div>

        {/* CENTER: Editor */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-slate-200">
          {/* Prompt header */}
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-md bg-slate-700 px-2.5 py-1 text-[11px] font-bold uppercase text-white tracking-wide">
                Module 2: Writing Task 2
              </span>
              <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                <svg
                  width="12"
                  height="12"
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
                40 phút
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">
              &quot;Some people think that the best way to reduce crime is to
              give longer prison sentences. Others, however, believe there are
              better alternative ways of reducing crime. Discuss both views and
              give your opinion.&quot;
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-4 py-2">
            {[
              { id: "fmt-bold", label: "B", bold: true },
              { id: "fmt-italic", label: "I", italic: true },
            ].map((btn) => (
              <button
                key={btn.id}
                id={btn.id}
                className={`grid h-8 w-8 place-items-center rounded-lg text-sm text-slate-600 hover:bg-slate-100 ${btn.bold ? "font-bold" : ""} ${btn.italic ? "italic" : ""}`}
              >
                {btn.label}
              </button>
            ))}
            <button
              id="fmt-undo"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 14 4 9 9 4" />
                <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
              </svg>
            </button>
            <button
              id="fmt-redo"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 14 20 9 15 4" />
                <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
              </svg>
            </button>
            <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
              <span>
                Mục tiêu: <strong className="text-slate-700">250+</strong>
              </span>
              <span>
                Số từ: <strong className="text-slate-700">142</strong>
              </span>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            id="writing-editor"
            className="flex-1 resize-none bg-white px-6 py-5 text-sm leading-8 text-slate-800 outline-none placeholder:text-slate-300"
            placeholder="Viết bài của bạn tại đây..."
            defaultValue={`The question of how to effectively reduce crime rates has long been a subject of intense debate. While some people thinks that imposing longer prison sentences is the most effective deterrent, others contend that alternative methods offer a more sustainable solution to social instability.\n\nOn the one hand, proponents of lengthy incarceration periods believe that strict punishment servez as a powerful deterrent. By keeping criminals away from society for extended durations, the immediate threat to public safety is reduced. Moreover, it is argue that the fear of a long sentence might discourage potential offenders from committing serious crimes...`}
          />
        </div>

        {/* RIGHT: Smart Outline */}
        <div className="hidden xl:flex w-[260px] shrink-0 flex-col bg-white px-4 py-5 gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Dàn ý thông minh
            </h3>
            <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Basic Scaffolding
            </span>
          </div>

          {/* Outline steps */}
          {[
            {
              id: "outline-1",
              num: "1. Mở bài",
              label: "Mở bài",
              badge: "✓ INSERT",
              badgeColor: "text-[#1a3a5c] bg-blue-50 border border-blue-200",
              content: '"Lĩnh vực này luôn là vấn đề gây tranh cãi..."',
              sub: "✓ Hoàn thành",
              subColor: "text-emerald-600",
              highlight: false,
              expanded: false,
            },
            {
              id: "outline-2",
              num: "2. Thân bài 1",
              label: "Thân bài 1",
              badge: null,
              content: "Ưu điểm của án phạt tù dài",
              sub: "Gợi ý: Phân tích về tính răn đe (deterrent) và an toàn cộng đồng.",
              subColor: "text-slate-500",
              highlight: false,
              expanded: false,
            },
            {
              id: "outline-3",
              num: "3. Thân bài 2",
              label: "Thân bài 2",
              badge: "+ INSERT",
              badgeColor: "text-[#1a3a5c] bg-blue-50 border border-blue-200",
              content: "Giải pháp thay thế (Cải tạo)",
              sub: 'Suggestion: "Alternatively, vocational training and community service focus on rehabilitation rather than just punishment..."',
              subColor: "text-slate-500 italic",
              highlight: true,
              expanded: true,
            },
            {
              id: "outline-4",
              num: "4. Kết bài",
              label: "Kết bài",
              badge: null,
              content: "Tổng kết & Ý kiến",
              sub: "Tóm tắt các ý và khẳng định lại quan điểm của bạn.",
              subColor: "text-slate-500",
              highlight: false,
              expanded: false,
            },
          ].map((step) => (
            <div
              key={step.id}
              id={step.id}
              className={`rounded-xl border p-3.5 ${step.highlight ? "border-[#1a3a5c] bg-blue-50/40" : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  {step.num}
                </p>
                {step.badge && (
                  <button
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${step.badgeColor || ""}`}
                  >
                    {step.badge}
                  </button>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {step.content}
              </p>
              {step.expanded && (
                <p
                  className={`mt-1.5 text-xs leading-relaxed ${step.subColor}`}
                >
                  {step.sub}
                </p>
              )}
              {!step.expanded && step.sub && (
                <p className={`mt-1 text-xs ${step.subColor}`}>{step.sub}</p>
              )}
            </div>
          ))}

          {/* Teacher support */}
          <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Giáo viên hỗ trợ
              </p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                Mrs. Lan đang online
              </p>
            </div>
            <button
              id="teacher-chat-btn"
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center gap-4 border-t border-slate-200 bg-[#1a3a5c] px-6 py-3">
        {/* AI Coach */}
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-teal-500 text-white">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
              AI Writing Coach
            </p>
            <p className="text-xs font-semibold text-white">
              Cố vấn chiến thuật
            </p>
          </div>
        </div>

        {/* Tip */}
        <div className="hidden md:flex items-center gap-1.5 ml-2">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 inline-block" />
          <p className="text-xs text-slate-300">
            Chiến thuật: Thân bài 2 của bạn cần thêm ví dụ thực tế để tăng điểm
            T.
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-teal-400">
              Deep Analysis Ready
            </p>
            <p className="text-[10px] text-slate-400">
              AI sẽ chấm điểm chỉ tiết sau 4 tiêu chí sau khi nộp
            </p>
          </div>
          <button
            id="submit-writing-btn"
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#1a3a5c] hover:bg-slate-100 transition"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M8 12h8M12 8v8" />
            </svg>
            Nộp bài & Phân tích AI
          </button>
        </div>
      </div>
    </div>
  );
}
