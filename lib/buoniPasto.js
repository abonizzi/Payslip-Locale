export function calcBuoniPastoStats(payslips) {
  if (!payslips || payslips.length === 0) return null;

  const totale = payslips.reduce((sum, p) => sum + (p.totale_ticket || 0), 0);
  const giorniTotali = payslips.reduce((sum, p) => sum + (p.giorni_ticket || 0), 0);
  const media = totale / payslips.length;

  return { totale, giorniTotali, media, numBuste: payslips.length };
}
