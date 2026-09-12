"use client";

export default function EmptyYearState({ hasAnyData, selectedYear, message }) {
  if (hasAnyData && selectedYear !== "all") {
    return (
      <div className="rounded-2xl border border-dashed border-base-700 p-8 text-center text-sm text-slate-500">
        Nessuna busta paga per il {selectedYear}. Prova a cambiare anno dal menu in alto, oppure
        carica una busta di quell'anno.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-base-700 p-8 text-center text-sm text-slate-500">
      {message || "Nessuna busta paga caricata. Carica la prima per iniziare."}
    </div>
  );
}
