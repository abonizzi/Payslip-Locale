// Mappa il JSON restituito da Claude (schema descritto nel system prompt di
// /api/parse-payslip) sulla riga salvata in locale (IndexedDB).
// Usata lato client dopo aver ricevuto la risposta dall'endpoint AI.
export function mapParsedToRow(parsed, { filePath, fileName, fileType }) {
  const p = parsed.periodo || {};
  const dc = parsed.dati_contrattuali || {};
  const rf = parsed.retribuzione_fissa || {};
  const wt = parsed.welfare_e_ticket || {};
  const pf = parsed.previdenza_e_fisco || {};
  const tot = parsed.totali || {};
  const ratei = parsed.saldi_orari_ratei || {};
  const prog = parsed.progressivi_e_tfr || {};

  return {
    file_path: filePath ?? null,
    file_name: fileName ?? null,
    file_type: fileType ?? null,

    mese: p.mese ?? null,
    anno: p.anno ?? null,

    ccnl: dc.ccnl ?? null,
    livello: dc.livello ?? null,
    paga_oraria: dc.paga_oraria ?? null,
    ore_ordinarie_mese: dc.ore_ordinarie_mese ?? null,
    giorni_lavorati: dc.giorni_lavorati ?? null,

    minimo_tabellare: rf.minimo_tabellare ?? null,
    scatti_anzianita: rf.scatti_anzianita ?? null,
    indennita_mansione: rf.indennita_mansione ?? null,
    indennita_mensa: rf.indennita_mensa ?? null,
    totale_lordo_fisso: rf.totale_lordo_fisso ?? null,

    voci_variabili: parsed.voci_variabili ?? [],

    giorni_ticket: wt.giorni_ticket ?? null,
    valore_unitario_ticket: wt.valore_unitario_ticket ?? null,
    totale_ticket: wt.totale_ticket ?? null,

    imponibile_inps: pf.imponibile_inps ?? null,
    contributi_inps: pf.contributi_inps ?? null,
    imponibile_irpef: pf.imponibile_irpef ?? null,
    irpef_lorda: pf.irpef_lorda ?? null,
    detrazioni_lavoro_dipendente: pf.detrazioni_lavoro_dipendente ?? null,
    ulteriori_detrazioni: pf.ulteriori_detrazioni ?? null,
    irpef_netta: pf.irpef_netta ?? null,
    addizionale_regionale: pf.addizionale_regionale ?? null,
    addizionale_comunale: pf.addizionale_comunale ?? null,
    totale_trattenute: pf.totale_trattenute ?? null,

    lordo_totale: tot.lordo_totale ?? null,
    netto_in_busta: tot.netto_in_busta ?? null,

    saldi_ferie: ratei.ferie ?? {},
    saldi_rol_par: ratei.rol_par ?? {},
    saldi_flessibilita: ratei.flessibilita_banca_ore ?? {},

    imponibile_inps_progressivo: prog.imponibile_inps_progressivo ?? null,
    imponibile_irpef_progressivo: prog.imponibile_irpef_progressivo ?? null,
    irpef_pagata_progressiva: prog.irpef_pagata_progressiva ?? null,
    retribuzione_utile_tfr: prog.retribuzione_utile_tfr ?? null,
    tfr_trasferito_fondo: prog.tfr_trasferito_fondo ?? null,

    dati_completi: parsed,
  };
}
