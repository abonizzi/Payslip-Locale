import { getLatestPayslip } from "./ral";

// Proiezione a fine anno: assume che la maturazione mensile resti costante
// (uguale a quella dell'ultima busta caricata) per tutti i mesi rimanenti,
// e che non vengano prese ulteriori ferie/ROL da qui a dicembre. È quindi
// una proiezione "a contratto invariato", non una previsione garantita.
export function calcProiezioneFineAnno(payslips) {
  const latest = getLatestPayslip(payslips);
  if (!latest) return null;

  const mesiRimanenti = Math.max(0, 12 - (latest.mese || 0));

  const maturatoMensileFerie = latest.saldi_ferie?.maturato_ore ?? 0;
  const saldoAttualeFerie = latest.saldi_ferie?.saldo_ore ?? 0;
  const proiezioneFerie = saldoAttualeFerie + maturatoMensileFerie * mesiRimanenti;

  const maturatoMensileRol = latest.saldi_rol_par?.maturato_ore ?? 0;
  const saldoAttualeRol = latest.saldi_rol_par?.saldo_ore ?? 0;
  const proiezioneRol = saldoAttualeRol + maturatoMensileRol * mesiRimanenti;

  return {
    anno: latest.anno,
    ultimoMese: latest.mese,
    mesiRimanenti,
    ferie: {
      saldoAttuale: saldoAttualeFerie,
      maturatoMensile: maturatoMensileFerie,
      proiezione: proiezioneFerie,
    },
    rol: {
      saldoAttuale: saldoAttualeRol,
      maturatoMensile: maturatoMensileRol,
      proiezione: proiezioneRol,
    },
    totaleProiezione: proiezioneFerie + proiezioneRol,
  };
}
