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
import { periodoLabel, formatOre } from "@/lib/format";

const TOOLTIP_STYLE = {
  backgroundColor: "#0f141b",
  border: "1px solid #2a3441",
  borderRadius: 8,
  fontSize: 12,
};

export default function SaldiTrendChart({ payslips }) {
  if (!payslips || payslips.length === 0) return null;

  const data = payslips.map((p) => ({
    periodo: periodoLabel(p),
    "Saldo Ferie": p.saldi_ferie?.saldo_ore ?? null,
    "Saldo ROL/PAR": p.saldi_rol_par?.saldo_ore ?? null,
  }));

  return (
    <div className="rounded-2xl border border-base-700 bg-base-900 p-3">
      <h3 className="text-sm font-medium text-slate-300 mb-2 px-1">
        Andamento saldi nel tempo
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ left: -20, right: 10 }}>
          <CartesianGrid stroke="#1c2430" vertical={false} />
          <XAxis dataKey="periodo" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatOre(value)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="Saldo Ferie" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Saldo ROL/PAR" stroke="#67e8f9" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
