"use client";

import { useState } from "react";
import { Download, Share, CheckCircle2, PlusSquare } from "lucide-react";
import { useInstallPrompt } from "@/lib/useInstallPrompt";

export default function InstallAppButton() {
  const { isInstallable, isStandalone, isIos, promptInstall } = useInstallPrompt();
  const [showIosHelp, setShowIosHelp] = useState(false);

  if (isStandalone) {
    return (
      <div className="flex items-center gap-2 text-sm text-good rounded-xl border border-good/30 bg-good/10 px-3 py-2">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        App già installata su questo dispositivo.
      </div>
    );
  }

  async function handleClick() {
    if (isInstallable) {
      await promptInstall();
      return;
    }
    // Su iOS Safari (e in generale quando il browser non espone il prompt
    // automatico) mostriamo le istruzioni manuali.
    setShowIosHelp(true);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        className="flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 text-accent-soft font-medium py-2.5 px-4 active:scale-[0.99] transition"
      >
        <Download className="h-4 w-4" />
        Installa l'app su questo dispositivo
      </button>

      {(showIosHelp || isIos) && !isInstallable && (
        <div className="text-sm text-slate-400 rounded-xl border border-base-700 bg-base-850 p-3 flex flex-col gap-1.5">
          <p className="font-medium text-slate-300">Su iPhone/iPad (Safari):</p>
          <p className="flex items-center gap-1.5">
            1. Tocca <Share className="h-3.5 w-3.5 inline text-accent" /> "Condividi" nella barra in basso
          </p>
          <p className="flex items-center gap-1.5">
            2. Scegli <PlusSquare className="h-3.5 w-3.5 inline text-accent" /> "Aggiungi a Home"
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Su Android/Chrome: menu ⋮ → "Aggiungi a schermata Home" (o usa il pulsante sopra).
          </p>
        </div>
      )}
    </div>
  );
}
