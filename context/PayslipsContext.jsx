"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { getStoredYear, saveStoredYear } from "@/lib/settingsStore";
import {
  getAllPayslips,
  addPayslipLocal,
  deletePayslipLocal,
} from "@/lib/localDb";

const PayslipsContext = createContext(null);

export function PayslipsProvider({ children }) {
  const [allPayslips, setAllPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYearState] = useState("all");
  const [yearInitialized, setYearInitialized] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPayslips();
      // Ordina per anno/mese, come faceva prima la query su Supabase.
      data.sort((a, b) => (a.anno - b.anno) || (a.mese - b.mese));
      setAllPayslips(data);
    } catch (err) {
      console.error("Errore nel caricamento locale delle buste paga:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const years = useMemo(() => {
    const set = new Set(allPayslips.map((p) => p.anno).filter((y) => y != null));
    return [...set].sort((a, b) => b - a);
  }, [allPayslips]);

  useEffect(() => {
    if (yearInitialized || years.length === 0) return;
    const stored = getStoredYear();
    if (stored === "all" || (typeof stored === "number" && years.includes(stored))) {
      setSelectedYearState(stored);
    } else {
      setSelectedYearState(years[0]);
    }
    setYearInitialized(true);
  }, [years, yearInitialized]);

  function setSelectedYear(year) {
    setSelectedYearState(year);
    saveStoredYear(year);
  }

  const payslips = useMemo(() => {
    if (selectedYear === "all") return allPayslips;
    return allPayslips.filter((p) => p.anno === selectedYear);
  }, [allPayslips, selectedYear]);

  // Salva la riga estratta + il file originale (Blob) in IndexedDB.
  async function addPayslip(row, fileBlob, mediaType, fileName) {
    const saved = await addPayslipLocal(row, fileBlob, mediaType, fileName);
    setAllPayslips((prev) => [...prev, saved]);
    if (saved?.anno && selectedYear !== "all" && saved.anno !== selectedYear) {
      setSelectedYear(saved.anno);
    }
    return saved;
  }

  async function deletePayslip(payslip) {
    if (!payslip?.id) return { ok: false, error: "Busta paga non valida." };
    try {
      await deletePayslipLocal(payslip.id);
      setAllPayslips((prev) => prev.filter((p) => p.id !== payslip.id));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || "Errore durante la cancellazione." };
    }
  }

  return (
    <PayslipsContext.Provider
      value={{
        payslips,
        allPayslips,
        years,
        selectedYear,
        setSelectedYear,
        loading,
        reload,
        addPayslip,
        deletePayslip,
        connected: true, // il salvataggio locale è sempre "pronto", nessuna configurazione richiesta
      }}
    >
      {children}
    </PayslipsContext.Provider>
  );
}

export function usePayslips() {
  const ctx = useContext(PayslipsContext);
  if (!ctx) {
    throw new Error("usePayslips deve essere usato dentro <PayslipsProvider>");
  }
  return ctx;
}
