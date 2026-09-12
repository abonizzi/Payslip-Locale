"use client";

export default function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-base-700 bg-base-900 p-4 flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className={`h-4 w-4 ${accent || "text-accent"}`} />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-xl font-semibold truncate">{value}</span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  );
}
