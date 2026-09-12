"use client";

import { Ticket, Wallet, TrendingUp, CalendarDays } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import StatCard from "@/components/StatCard";
import EmptyYearState from "@/components/EmptyYearState";
import TicketChart from "@/components/charts/TicketChart";
import { usePayslips } from "@/context/PayslipsContext";
import { formatEuro, periodoLabel } from "@/lib/format";
import { calcBuoniPastoStats } from "@/lib/buoniPasto";

export default function BuoniPastoPage() {
  const { payslips, allPayslips, selectedYear, loading } = usePayslips();
  const stats = calcBuoniPastoStats(payslips);
  const ordinati = [...payslips].sort((a, b) => (b.anno - a.anno) || (b.mese - a.mese));

  return (
    <main className="max-w-md sm:max-w-2xl lg:max-w-6xl mx-auto px-4 pb-28 pt-6 flex flex-col gap-5">
      <AppHeader icon={Ticket} title="Buoni Pasto" subtitle="Quantità e valore mese per mese" />

      {loading && payslips.length === 0 ? (
        <div className="text-center text-sm text-slate-500 py-8">Caricamento…</div>
      ) : !stats ? (
        <EmptyYearState
          hasAnyData={allPayslips.length > 0}
          selectedYear={selectedYear}
          message="Nessuna busta paga caricata. Carica la prima dalla Dashboard per vedere qui i buoni pasto."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              icon={Wallet}
              label="Totale percepito"
              value={formatEuro(stats.totale)}
              sub={`su ${stats.numBuste} bust${stats.numBuste === 1 ? "a" : "e"}`}
              accent="text-good"
            />
            <StatCard
              icon={TrendingUp}
              label="Media mensile"
              value={formatEuro(stats.media)}
              accent="text-accent-soft"
            />
            <StatCard
              icon={CalendarDays}
              label="Giorni totali"
              value={`${stats.giorniTotali} gg`}
              sub="ticket maturati"
            />
          </div>

          <TicketChart payslips={payslips} />

          <section>
            <h2 className="text-sm font-medium text-slate-300 mb-2 px-1">Dettaglio mensile</h2>
            <div className="rounded-2xl border border-base-700 bg-base-900 overflow-hidden divide-y divide-base-700">
              {ordinati.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 text-sm">
                  <span className="font-medium">{periodoLabel(p)}</span>
                  <span className="text-slate-400">{p.giorni_ticket ?? "—"} gg</span>
                  <span className="font-medium text-good">{formatEuro(p.totale_ticket)}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
