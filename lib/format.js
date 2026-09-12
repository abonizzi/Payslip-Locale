export const MESI = [
  "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
  "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
];

export const MESI_ESTESI = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

export function formatEuro(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatOre(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${Number(value).toFixed(1)} h`;
}

// Converte ore in giorni su base 8h/giorno, come richiesto per Ferie e ROL/PAR.
export function oreInGiorni(ore) {
  if (ore === null || ore === undefined || Number.isNaN(ore)) return null;
  return Number(ore) / 8;
}

export function formatGiorni(ore) {
  const giorni = oreInGiorni(ore);
  if (giorni === null) return "—";
  return `${giorni.toFixed(1)} gg`;
}

export function periodoLabel(payslip) {
  if (!payslip?.mese || !payslip?.anno) return "—";
  const meseIdx = Math.min(Math.max(payslip.mese - 1, 0), 11);
  return `${MESI[meseIdx]} ${payslip.anno}`;
}

// Riconosce le tranche di Premio di Produzione tra le voci variabili,
// così l'UI può evidenziarle rispetto alla paga fissa.
export function estraiPremiProduzione(vociVariabili) {
  if (!Array.isArray(vociVariabili)) return [];
  return vociVariabili.filter((v) =>
    /premio|produzione|tranche/i.test(v?.descrizione || "")
  );
}
