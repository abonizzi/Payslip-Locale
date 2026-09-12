import { estraiPremiProduzione } from "./format";

// Busta paga più recente, in ordine cronologico (anno, poi mese).
export function getLatestPayslip(payslips) {
  if (!payslips || payslips.length === 0) return null;
  return [...payslips].sort((a, b) => (a.anno - b.anno) || (a.mese - b.mese)).at(-1);
}

// RAL "reale": quanto hai EFFETTIVAMENTE percepito nell'anno dell'ultima
// busta caricata, sommando il lordo di tutte le buste di quell'anno.
// Non è una proiezione: è un consuntivo parziale (cresce mese dopo mese man
// mano che carichi nuove buste).
export function calcRalReale(payslips) {
  const latest = getLatestPayslip(payslips);
  if (!latest) return null;

  const stessoAnno = payslips.filter((p) => p.anno === latest.anno);
  const totale = stessoAnno.reduce((sum, p) => sum + (p.lordo_totale || 0), 0);

  return {
    anno: latest.anno,
    totale,
    numBuste: stessoAnno.length,
    ultimoMese: latest.mese,
  };
}

// Somma le tranche di Premio di Produzione già caricate per un dato anno.
// Se non hai ancora caricato tutte le tranche (es. solo quella di luglio),
// il totale rifletterà solo quanto già documentato, non una stima.
export function calcBonusProduzioneAnnuo(payslips, anno) {
  const stessoAnno = payslips.filter((p) => p.anno === anno);
  let totale = 0;
  for (const p of stessoAnno) {
    const premi = estraiPremiProduzione(p.voci_variabili);
    totale += premi.reduce((s, v) => s + (v.importo_lordo || 0), 0);
  }
  return totale;
}

// RAL "ipotetica": proiezione teorica basata sulla retribuzione fissa
// dell'ultima busta (minimo tabellare + scatti di anzianità + indennità di
// mansione) moltiplicata per 13 mensilità, + il bonus produzione già
// documentato nell'anno. Esclude volutamente l'indennità mensa/ticket, che
// per prassi non fa parte della RAL contrattuale.
export function calcRalIpotetica(payslips) {
  const latest = getLatestPayslip(payslips);
  if (!latest) return null;

  const baseMensile =
    (latest.minimo_tabellare || 0) +
    (latest.scatti_anzianita || 0) +
    (latest.indennita_mansione || 0);

  const base13 = baseMensile * 13;
  const bonusProduzione = calcBonusProduzioneAnnuo(payslips, latest.anno);

  return {
    anno: latest.anno,
    baseMensile,
    base13,
    bonusProduzione,
    totale: base13 + bonusProduzione,
  };
}

// Lordo medio mensile: media del lordo totale su TUTTE le buste caricate
// (bonus e premi inclusi, come richiesto), a prescindere dall'anno.
export function calcLordoMedioMensile(payslips) {
  if (!payslips || payslips.length === 0) return null;
  const totale = payslips.reduce((sum, p) => sum + (p.lordo_totale || 0), 0);
  return totale / payslips.length;
}
