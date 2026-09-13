"use client";

import { useEffect, useState } from "react";
import { getStoredMensilita } from "./settingsStore";

export function useMensilita() {
  const [mensilita, setMensilita] = useState(13);

  useEffect(() => {
    setMensilita(getStoredMensilita());
  }, []);

  return mensilita;
}
