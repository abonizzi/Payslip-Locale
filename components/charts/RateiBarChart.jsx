"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatOre } from "@/lib/format";

const TOOLTIP_STYLE = {
  backgroundColor: "#0f141b",
  border: "1px solid #2a3441",
  borderRadius: 8,
  fontSize: 12,
};

export default function RateiBarChart({ latestPayslip }) {
  if (!latestPayslip) return null;

  const data = [
    {
      voce: "Ferie",
      Maturato: latestPayslip.saldi_ferie?.maturato_ore ?? 0,
      Goduto: latestPayslip.saldi_ferie?.goduto_ore ?? 0,
      Saldo: latestPayslip.saldi_ferie?.saldo_ore ?? 0,
    },
    {
      voce: "ROL/PAR",
      Maturato: latestPayslip.saldi_rol_par?.maturato_ore ?? 0,
      Goduto: latestPayslip.saldi_rol_par?.goduto_ore ?? 0,
      Saldo: latestPayslip.saldi_rol_par?.saldo_ore ?? 0,
    },
    {
      voce: "Banca ore",
      Maturato: latestPayslip.saldi_flessibilita?.maturato_ore ?? 0,
      Goduto: latestPayslip.saldi_flessibilita?.goduto_ore ?? 0,
      Saldo: latestPayslip.saldi_flessibilita?.saldo_ore ?? 0,
    },
  ];

  return (
    <div className="rounded-2xl border border-base-700 bg-base-900 p-3">
      <h3 className="text-sm font-medium text-slate-300 mb-2 px-1">
        Maturato vs Goduto vs Saldo (ultima busta)
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ left: -20, right: 10 }}>
          <CartesianGrid stroke="#1c2430" vertical={false} />
          <XAxis dataKey="voce" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatOre(value)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Maturato" fill="#67e8f9" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Goduto" fill="#fbbf24" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Saldo" fill="#34d399" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
