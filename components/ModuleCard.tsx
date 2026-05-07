import Link from "next/link";

interface ModuleCardProps {
  title: string;
  description: string;
  href: string;
  progress: number;
}

export function ModuleCard({
  title,
  description,
  href,
  progress,
}: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
            Module
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
          {progress}%
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
    </Link>
  );
}
