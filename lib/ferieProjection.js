import { getLatestPayslip } from "./ral";

// La voce "Maturato" in busta paga è un progressivo cumulato da gennaio, non
// la maturazione del singolo mese. Per isolarla confrontiamo due buste
// consecutive; gestiamo 3 casi:
//
// 1. Gennaio: non c'è un mese precedente nell'anno, il "Maturato" di gennaio
//    coincide già con la maturazione del singolo mese → calcolo esatto.
// 2. Esiste una busta di un mese precedente nello stesso anno: la differenza
//    tra i due "Maturato" isola la maturazione del periodo. Se le buste sono
//    consecutive (es. luglio → agosto) è un calcolo esatto; se ci sono mesi
//    saltati in mezzo, dividiamo per il numero di mesi trascorsi ottenendo
//    una media.
// 3. Nessuna busta precedente disponibile nello stesso anno (es. hai
//    caricato solo l'ultima): stimiamo dividendo il "Maturato" per il numero
//    del mese, assumendo una maturazione lineare da gennaio. È la stima meno
//    precisa dei tre casi.
function calcMaturazioneMensile(latest, previous, campo) {
  const maturatoLatest = latest[campo]?.maturato_ore ?? 0;

  if (latest.mese === 1) {
    return { valore: maturatoLatest, metodo: "esatto" };
  }

  if (previous) {
    const maturatoPrev = previous[campo]?.maturato_ore ?? 0;
    const deltaMesi = latest.mese - previous.mese;
    if (deltaMesi > 0) {
      const media = (maturatoLatest - maturatoPrev) / deltaMesi;
      return { valore: media, metodo: deltaMesi === 1 ? "esatto" : "media" };
    }
  }

  const stima = latest.mese > 0 ? maturatoLatest / latest.mese : maturatoLatest;
  return { valore: stima, metodo: "stima" };
}

// Proiezione a fine anno: assume che la maturazione mensile isolata come
// sopra resti costante per i mesi rimanenti, e che non vengano prese
// ulteriori ferie/ROL da qui a dicembre. È quindi una proiezione "a
// contratto invariato", non una previsione garantita.
export function calcProiezioneFineAnno(payslips) {
  const latest = getLatestPayslip(payslips);
  if (!latest) return null;

  const mesiRimanenti = Math.max(0, 12 - (latest.mese || 0));

  // Busta immediatamente precedente (per mese) nello stesso anno.
  const precedentiStessoAnno = payslips.filter(
    (p) => p.anno === latest.anno && p.mese < latest.mese
  );
  const previous =
    precedentiStessoAnno.length > 0
      ? precedentiStessoAnno.reduce((max, p) => (p.mese > max.mese ? p : max))
      : null;

  const ferieRate = calcMaturazioneMensile(latest, previous, "saldi_ferie");
  const rolRate = calcMaturazioneMensile(latest, previous, "saldi_rol_par");

  const saldoAttualeFerie = latest.saldi_ferie?.saldo_ore ?? 0;
  const saldoAttualeRol = latest.saldi_rol_par?.saldo_ore ?? 0;

  const proiezioneFerie = saldoAttualeFerie + ferieRate.valore * mesiRimanenti;
  const proiezioneRol = saldoAttualeRol + rolRate.valore * mesiRimanenti;

  return {
    anno: latest.anno,
    ultimoMese: latest.mese,
    mesiRimanenti,
    ferie: {
      saldoAttuale: saldoAttualeFerie,
      maturatoMensile: ferieRate.valore,
      metodo: ferieRate.metodo,
      proiezione: proiezioneFerie,
    },
    rol: {
      saldoAttuale: saldoAttualeRol,
      maturatoMensile: rolRate.valore,
      metodo: rolRate.metodo,
      proiezione: proiezioneRol,
    },
    totaleProiezione: proiezioneFerie + proiezioneRol,
  };
}
