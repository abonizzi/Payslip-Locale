// Helper localStorage per preferenze locali (layout, anno selezionato).
// In questa versione "locale" non c'è configurazione Supabase da salvare:
// tutti i dati delle buste paga vivono in IndexedDB (vedi lib/localDb.js).

const LAYOUT_KEY = "buste-paga:layout-pref";
const YEAR_KEY = "buste-paga:selected-year";

export function getStoredLayoutPref() {
  if (typeof window === "undefined") return "auto";
  return window.localStorage.getItem(LAYOUT_KEY) || "auto";
}

export function saveStoredLayoutPref(pref) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAYOUT_KEY, pref);
}

// "all" oppure un anno numerico (es. 2026). Ricordato per dispositivo, così
// riaprendo l'app resta impostato l'ultimo anno che stavi guardando.
export function getStoredYear() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(YEAR_KEY);
  if (!raw) return null;
  return raw === "all" ? "all" : Number(raw);
}

export function saveStoredYear(year) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(YEAR_KEY, String(year));
}
