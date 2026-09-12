"use client";

import { Palmtree, CalendarClock, Clock3, Layers } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import StatCard from "@/components/StatCard";
import EmptyYearState from "@/components/EmptyYearState";
import RateiBarChart from "@/components/charts/RateiBarChart";
import SaldiTrendChart from "@/components/charts/SaldiTrendChart";
import { usePayslips } from "@/context/PayslipsContext";
import { formatOre, formatGiorni } from "@/lib/format";
import { getLatestPayslip } from "@/lib/ral";

export default function FerieRolPage() {
  const { payslips, allPayslips, selectedYear, loading } = usePayslips();
  const latest = getLatestPayslip(payslips);

  const saldoFerie = latest?.saldi_ferie?.saldo_ore ?? null;
  const saldoRol = latest?.saldi_rol_par?.saldo_ore ?? null;
  const saldoCombinato =
    saldoFerie !== null || saldoRol !== null ? (saldoFerie || 0) + (saldoRol || 0) : null;

  const flessMaturato = latest?.saldi_flessibilita?.maturato_ore ?? null;
  const flessGoduto = latest?.saldi_flessibilita?.goduto_ore ?? null;

  return (
    <main className="max-w-md sm:max-w-2xl lg:max-w-6xl mx-auto px-4 pb-28 pt-6 flex flex-col gap-5">
      <AppHeader icon={Palmtree} title="Ferie e ROL" subtitle="Saldi e andamento nel tempo" />

      {loading && payslips.length === 0 ? (
        <div className="text-center text-sm text-slate-500 py-8">Caricamento…</div>
      ) : !latest ? (
        <EmptyYearState
          hasAnyData={allPayslips.length > 0}
          selectedYear={selectedYear}
          message="Nessuna busta paga caricata. Carica la prima dalla Dashboard per vedere qui i saldi."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={Layers}
              label="Ferie + ROL/PAR"
              value={formatOre(saldoCombinato)}
              sub={formatGiorni(saldoCombinato)}
              accent="text-good"
            />
            <StatCard
              icon={Palmtree}
              label="Ferie residue"
              value={formatOre(saldoFerie)}
              sub={formatGiorni(saldoFerie)}
              accent="text-warn"
            />
            <StatCard
              icon={CalendarClock}
              label="ROL / PAR residui"
              value={formatOre(saldoRol)}
              sub={formatGiorni(saldoRol)}
              accent="text-warn"
            />
            <StatCard
              icon={Clock3}
              label="Banca ore maturate"
              value={formatOre(flessMaturato)}
              sub={`Godute: ${formatOre(flessGoduto)}`}
              accent="text-accent-soft"
            />
          </div>

          <RateiBarChart latestPayslip={latest} />
          <SaldiTrendChart payslips={payslips} />
        </>
      )}
    </main>
  );
}
