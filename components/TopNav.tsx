import Link from "next/link";

export function TopNav({ title }: { title: string }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          {title}
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="#"
          className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
        >
          Hồ sơ
        </Link>
      </div>
    </div>
  );
}
