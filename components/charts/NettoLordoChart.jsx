"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { periodoLabel, formatEuro } from "@/lib/format";

const TOOLTIP_STYLE = {
  backgroundColor: "#0f141b",
  border: "1px solid #2a3441",
  borderRadius: 8,
  fontSize: 12,
};

export default function NettoLordoChart({ payslips }) {
  if (!payslips || payslips.length === 0) return null;

  const ordinati = [...payslips].sort((a, b) => (a.anno - b.anno) || (a.mese - b.mese));
  const data = ordinati.map((p) => ({
    periodo: periodoLabel(p),
    Netto: p.netto_in_busta,
    Lordo: p.lordo_totale,
  }));

  return (
    <div className="rounded-2xl border border-base-700 bg-base-900 p-3">
      <h3 className="text-sm font-medium text-slate-300 mb-2 px-1">
        Andamento Netto vs Lordo
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ left: -20, right: 10 }}>
          <CartesianGrid stroke="#1c2430" vertical={false} />
          <XAxis dataKey="periodo" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatEuro(value)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="Lordo" stroke="#67e8f9" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Netto" stroke="#34d399" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
