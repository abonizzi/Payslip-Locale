"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, ExternalLink, Loader2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import EmptyYearState from "@/components/EmptyYearState";
import { usePayslips } from "@/context/PayslipsContext";
import { getFileRecord } from "@/lib/localDb";
import { periodoLabel } from "@/lib/format";

function isPdf(payslip) {
  if (payslip.file_type) return payslip.file_type === "application/pdf";
  return (payslip.file_name || "").toLowerCase().endsWith(".pdf");
}

export default function DocumentiPage() {
  const { payslips, allPayslips, selectedYear, loading } = usePayslips();
  const [openingId, setOpeningId] = useState(null);
  const [error, setError] = useState("");

  const ordinati = [...payslips].sort((a, b) => (b.anno - a.anno) || (b.mese - a.mese));

  async function handleOpen(payslip) {
    setError("");
    setOpeningId(payslip.id);
    try {
      const record = await getFileRecord(payslip.id);
      if (!record?.blob) {
        throw new Error("File non trovato in locale (potrebbe essere stato caricato prima di questa versione).");
      }
      // Crea un URL temporaneo verso il file salvato in IndexedDB e lo apre.
      const url = URL.createObjectURL(record.blob);
      window.open(url, "_blank", "noopener,noreferrer");
      // Libera la memoria dopo un minuto: tempo ampio per far caricare la scheda.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(`Impossibile aprire il file: ${err.message || "errore sconosciuto"}`);
    } finally {
      setOpeningId(null);
    }
  }

  return (
    <main className="max-w-md sm:max-w-2xl lg:max-w-6xl mx-auto px-4 pb-28 pt-6 flex flex-col gap-5">
      <AppHeader icon={FileText} title="Documenti" subtitle="I file originali caricati" />

      {error && (
        <div className="rounded-xl border border-bad/30 bg-bad/10 text-bad text-sm p-3">
          {error}
        </div>
      )}

      {loading && payslips.length === 0 ? (
        <div className="text-center text-sm text-slate-500 py-8">Caricamento…</div>
      ) : ordinati.length === 0 ? (
        <EmptyYearState
          hasAnyData={allPayslips.length > 0}
          selectedYear={selectedYear}
          message="Nessun documento caricato. Carica una busta paga dalla Dashboard per vederla qui."
        />
      ) : (
        <div className="rounded-2xl border border-base-700 bg-base-900 overflow-hidden divide-y divide-base-700">
          {ordinati.map((p) => {
            const pdf = isPdf(p);
            const opening = openingId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleOpen(p)}
                disabled={opening}
                className="w-full flex items-center gap-3 p-4 text-left active:bg-base-850 disabled:opacity-50"
              >
                <div className="h-10 w-10 rounded-xl bg-base-800 flex items-center justify-center shrink-0">
                  {pdf ? (
                    <FileText className="h-5 w-5 text-accent" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-accent" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{periodoLabel(p)}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {p.file_name || "Nome file non disponibile"}
                  </p>
                </div>
                {opening ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500 shrink-0" />
                ) : (
                  <ExternalLink className="h-4 w-4 text-slate-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}
