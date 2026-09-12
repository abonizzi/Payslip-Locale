"use client";

import { useRef, useState } from "react";
import { FileText, Image as ImageIcon, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { mapParsedToRow } from "@/lib/mapPayslip";
import { usePayslips } from "@/context/PayslipsContext";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UploadCard() {
  const { addPayslip } = usePayslips();
  const pdfInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  async function handleFile(e, inputRef) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("loading");
    setMessage("Estrazione dati in corso con l'AI…");

    try {
      const base64 = await fileToBase64(file);
      const mediaType = file.type || "application/pdf";

      // 1. Estrazione dati tramite l'endpoint server (chiave Gemini segreta)
      const res = await fetch("/api/parse-payslip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: base64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Estrazione AI fallita: ${data.error || "errore sconosciuto"}`);
      }

      // 2. Salvataggio in locale (IndexedDB): dati estratti + file originale
      setMessage("Salvataggio in locale…");
      const row = mapParsedToRow(data.parsed, {
        filePath: null,
        fileName: file.name,
        fileType: mediaType,
      });

      const saved = await addPayslip(row, file, mediaType, file.name);

      setStatus("success");
      setMessage("Busta paga caricata, analizzata e salvata su questo dispositivo.");
      void saved;
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Errore imprevisto.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    }
  }

  if (status !== "idle") {
    return (
      <div className="rounded-2xl border border-base-700 bg-base-900 p-4">
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-base-600 py-8 px-4 text-center">
          {status === "loading" && <Loader2 className="h-8 w-8 animate-spin text-accent" />}
          {status === "success" && <CheckCircle2 className="h-8 w-8 text-good" />}
          {status === "error" && <XCircle className="h-8 w-8 text-bad" />}
          <span className="font-medium">
            {status === "loading" && "Analisi in corso…"}
            {status === "success" && "Fatto!"}
            {status === "error" && "Errore"}
          </span>
          <span className="text-sm text-slate-400">{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-base-700 bg-base-900 p-4">
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => handleFile(e, pdfInputRef)}
        className="hidden"
        id="payslip-upload-pdf"
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e, photoInputRef)}
        className="hidden"
        id="payslip-upload-photo"
      />

      <p className="text-sm font-medium text-slate-300 mb-3 text-center">Carica busta paga</p>

      <div className="grid grid-cols-2 gap-3">
        <label
          htmlFor="payslip-upload-pdf"
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-base-600 py-6 px-3 text-center active:scale-[0.99] transition cursor-pointer"
        >
          <FileText className="h-7 w-7 text-accent" />
          <span className="font-medium text-sm">File PDF</span>
          <span className="text-xs text-slate-400">Scelto dai tuoi file</span>
        </label>

        <label
          htmlFor="payslip-upload-photo"
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-base-600 py-6 px-3 text-center active:scale-[0.99] transition cursor-pointer"
        >
          <ImageIcon className="h-7 w-7 text-accent" />
          <span className="font-medium text-sm">Foto</span>
          <span className="text-xs text-slate-400">Scatta o dalla galleria</span>
        </label>
      </div>
    </div>
  );
}
