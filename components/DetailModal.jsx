"use client";

import { useState } from "react";
import { X, Gift, Trash2, Loader2 } from "lucide-react";
import {
  periodoLabel,
  formatEuro,
  formatOre,
  formatGiorni,
  estraiPremiProduzione,
} from "@/lib/format";
import { Section, Row } from "@/components/InfoSection";
import { usePayslips } from "@/context/PayslipsContext";

export default function DetailModal({ payslip, onClose }) {
  const { deletePayslip } = usePayslips();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!payslip) return null;

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    const result = await deletePayslip(payslip);
    setDeleting(false);
    if (result.ok) {
      onClose();
    } else {
      setDeleteError(result.error);
      setConfirming(false);
    }
  }

  const premi = estraiPremiProduzione(payslip.voci_variabili);
  const altreVoci = (payslip.voci_variabili || []).filter(
    (v) => !premi.includes(v)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-base-900 rounded-t-2xl sm:rounded-2xl border border-base-700 p-4 safe-bottom">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{periodoLabel(payslip)}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-base-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-base-850 border border-base-700 p-3">
            <div className="text-xs text-slate-500">Lordo totale</div>
            <div className="text-lg font-semibold">{formatEuro(payslip.lordo_totale)}</div>
          </div>
          <div className="rounded-xl bg-base-850 border border-base-700 p-3">
            <div className="text-xs text-slate-500">Netto in busta</div>
            <div className="text-lg font-semibold text-good">
              {formatEuro(payslip.netto_in_busta)}
            </div>
          </div>
        </div>

        <Section title="Dati orari e contrattuali">
          <Row label="CCNL" value={payslip.ccnl || "—"} />
          <Row label="Livello" value={payslip.livello || "—"} />
          <Row label="Paga oraria" value={formatEuro(payslip.paga_oraria)} />
          <Row label="Ore ordinarie mese" value={payslip.ore_ordinarie_mese ?? "—"} />
          <Row label="Giorni lavorati" value={payslip.giorni_lavorati ?? "—"} />
        </Section>

        {premi.length > 0 && (
          <Section title="Premio di produzione">
            {premi.map((v, i) => (
              <Row
                key={i}
                label={
                  <span className="inline-flex items-center gap-1">
                    <Gift className="h-3.5 w-3.5 text-accent-soft" /> {v.descrizione}
                  </span>
                }
                value={formatEuro(v.importo_lordo)}
              />
            ))}
          </Section>
        )}

        {altreVoci.length > 0 && (
          <Section title="Altre voci variabili">
            {altreVoci.map((v, i) => (
              <Row key={i} label={v.descrizione} value={formatEuro(v.importo_lordo)} />
            ))}
          </Section>
        )}

        <Section title="Welfare e ticket">
          <Row label="Giorni ticket" value={payslip.giorni_ticket ?? "—"} />
          <Row label="Valore unitario" value={formatEuro(payslip.valore_unitario_ticket)} />
          <Row label="Totale ticket" value={formatEuro(payslip.totale_ticket)} />
        </Section>

        <Section title="Fisco e contributi">
          <Row label="Imponibile INPS" value={formatEuro(payslip.imponibile_inps)} />
          <Row label="Contributi INPS" value={formatEuro(payslip.contributi_inps)} />
          <Row label="Imponibile IRPEF" value={formatEuro(payslip.imponibile_irpef)} />
          <Row label="IRPEF lorda" value={formatEuro(payslip.irpef_lorda)} />
          <Row label="Detrazioni lav. dipendente" value={formatEuro(payslip.detrazioni_lavoro_dipendente)} />
          <Row label="Ulteriori detrazioni" value={formatEuro(payslip.ulteriori_detrazioni)} />
          <Row label="IRPEF netta" value={formatEuro(payslip.irpef_netta)} />
          <Row label="Addizionale regionale" value={formatEuro(payslip.addizionale_regionale)} />
          <Row label="Addizionale comunale" value={formatEuro(payslip.addizionale_comunale)} />
          <Row label="Totale trattenute" value={formatEuro(payslip.totale_trattenute)} />
        </Section>

        <Section title="Ferie">
          <Row label="Residuo anno prec." value={formatOre(payslip.saldi_ferie?.residuo_anno_precedente_ore)} />
          <Row label="Maturato" value={formatOre(payslip.saldi_ferie?.maturato_ore)} />
          <Row label="Goduto" value={formatOre(payslip.saldi_ferie?.goduto_ore)} />
          <Row
            label="Saldo"
            value={`${formatOre(payslip.saldi_ferie?.saldo_ore)} (${formatGiorni(payslip.saldi_ferie?.saldo_ore)})`}
          />
        </Section>

        <Section title="ROL / PAR">
          <Row label="Residuo anno prec." value={formatOre(payslip.saldi_rol_par?.residuo_anno_precedente_ore)} />
          <Row label="Maturato" value={formatOre(payslip.saldi_rol_par?.maturato_ore)} />
          <Row label="Goduto" value={formatOre(payslip.saldi_rol_par?.goduto_ore)} />
          <Row
            label="Saldo"
            value={`${formatOre(payslip.saldi_rol_par?.saldo_ore)} (${formatGiorni(payslip.saldi_rol_par?.saldo_ore)})`}
          />
        </Section>

        <Section title="Flessibilità / Banca ore">
          <Row label="Maturato" value={formatOre(payslip.saldi_flessibilita?.maturato_ore)} />
          <Row label="Goduto" value={formatOre(payslip.saldi_flessibilita?.goduto_ore)} />
          <Row label="Saldo" value={formatOre(payslip.saldi_flessibilita?.saldo_ore)} />
        </Section>

        <Section title="Progressivi e TFR">
          <Row label="Imponibile INPS progr." value={formatEuro(payslip.imponibile_inps_progressivo)} />
          <Row label="Imponibile IRPEF progr." value={formatEuro(payslip.imponibile_irpef_progressivo)} />
          <Row label="IRPEF pagata progr." value={formatEuro(payslip.irpef_pagata_progressiva)} />
          <Row label="Retribuzione utile TFR" value={formatEuro(payslip.retribuzione_utile_tfr)} />
          <Row label="TFR trasferito a fondo" value={formatEuro(payslip.tfr_trasferito_fondo)} />
        </Section>

        {deleteError && (
          <div className="rounded-xl border border-bad/30 bg-bad/10 text-bad text-sm p-3 mb-3">
            {deleteError}
          </div>
        )}

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-bad/30 text-bad py-2.5 font-medium active:bg-bad/10"
          >
            <Trash2 className="h-4 w-4" />
            Elimina busta paga
          </button>
        ) : (
          <div className="rounded-xl border border-bad/30 bg-bad/10 p-3 flex flex-col gap-2">
            <p className="text-sm text-bad">
              Eliminare definitivamente questa busta paga e il file originale? Non si può annullare.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-bad text-white py-2 font-medium disabled:opacity-60"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Conferma eliminazione
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="rounded-xl border border-base-700 px-4 py-2 text-sm text-slate-300"
              >
                Annulla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
