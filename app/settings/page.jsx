"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Monitor,
  Smartphone,
  WandSparkles,
  Download,
  Loader2,
} from "lucide-react";
import InstallAppButton from "@/components/InstallAppButton";
import FeedbackForm from "@/components/FeedbackForm";
import {
  getStoredLayoutPref,
  saveStoredLayoutPref,
  getStoredMensilita,
  saveStoredMensilita,
} from "@/lib/settingsStore";
import { getAllPayslips } from "@/lib/localDb";

function LayoutPrefSelector() {
  const [layoutPref, setLayoutPref] = useState("auto");

  useEffect(() => {
    setLayoutPref(getStoredLayoutPref());
  }, []);

  function choose(id) {
    setLayoutPref(id);
    saveStoredLayoutPref(id);
  }

  const options = [
    { id: "auto", label: "Automatico", icon: WandSparkles },
    { id: "mobile", label: "Mobile", icon: Smartphone },
    { id: "desktop", label: "Desktop", icon: Monitor },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = layoutPref === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => choose(opt.id)}
            className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs transition ${
              active
                ? "border-accent bg-accent/10 text-accent-soft"
                : "border-base-700 bg-base-850 text-slate-400"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function MensilitaSelector() {
  const [mensilita, setMensilita] = useState(13);

  useEffect(() => {
    setMensilita(getStoredMensilita());
  }, []);

  function choose(n) {
    setMensilita(n);
    saveStoredMensilita(n);
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {[12, 13, 14].map((n) => {
        const active = mensilita === n;
        return (
          <button
            key={n}
            onClick={() => choose(n)}
            className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs transition ${
              active
                ? "border-accent bg-accent/10 text-accent-soft"
                : "border-base-700 bg-base-850 text-slate-400"
            }`}
          >
            <span className="font-semibold text-base">{n}</span>
            <span>mensilità</span>
          </button>
        );
      })}
    </div>
  );
}

function BackupButton() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  async function handleExport() {
    setExporting(true);
    setError("");
    try {
      const data = await getAllPayslips();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-buste-paga-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Errore durante l'esportazione.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 text-accent-soft font-medium py-2.5 px-4 active:scale-[0.99] transition disabled:opacity-60"
      >
        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Esporta backup (dati, senza i file originali)
      </button>
      {error && <p className="text-xs text-bad">{error}</p>}
      <p className="text-xs text-slate-500">
        Scarica un file JSON con tutti i numeri estratti dalle tue buste paga. Non include i PDF/foto
        originali (restano solo su questo dispositivo). Utile come backup se cambi browser.
      </p>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  return (
    <main className="max-w-md sm:max-w-2xl mx-auto px-4 pb-24 pt-6 flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 rounded-full active:bg-base-800">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">Impostazioni</h1>
      </header>

      <div className="rounded-2xl border border-warn/30 bg-warn/10 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warn shrink-0 mt-0.5" />
        <p className="text-sm text-warn/90">
          I tuoi dati sono salvati <b>solo su questo dispositivo e questo browser</b> (versione
          locale, senza account). Cancellando i dati di navigazione, disinstallando l'app o
          passando a un altro telefono/computer, li perdi definitivamente. Usa "Esporta backup"
          qui sotto per avere una copia di riserva dei numeri (non dei file originali).
        </p>
      </div>

      <Section title="Backup" description="Scarica una copia dei dati estratti.">
        <BackupButton />
      </Section>

      <Section
        title="Aspetto"
        description="Scegli come vuoi visualizzare la dashboard su questo dispositivo."
      >
        <LayoutPrefSelector />
      </Section>

      <Section
        title="Calcolo RAL"
        description="Numero di mensilità usate nella proiezione della RAL ipotetica (pagina RAL). La quattordicesima, se scelta, viene calcolata come uguale alla mensilità base."
      >
        <MensilitaSelector />
      </Section>

      <Section
        title="Installazione"
        description="Installa l'app sulla schermata Home per usarla come un'app nativa, senza barra del browser."
      >
        <InstallAppButton />
      </Section>

      <Section
        title="Segnalazioni e suggerimenti"
        description="Hai trovato un problema o hai un'idea per migliorare l'app? Scrivicelo qui sotto."
      >
        <FeedbackForm />
      </Section>
    </main>
  );
}
