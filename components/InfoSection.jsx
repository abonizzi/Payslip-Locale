"use client";

export function Section({ title, children }) {
  return (
    <div className="mb-4">
      <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-2">{title}</h4>
      <div className="rounded-xl border border-base-700 bg-base-850 divide-y divide-base-700">
        {children}
      </div>
    </div>
  );
}

export function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
