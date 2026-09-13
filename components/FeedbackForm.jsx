"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

export default function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/send-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, replyTo: email || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore sconosciuto durante l'invio.");

      setStatus("sent");
      setMessage("");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-good/30 bg-good/10 text-good text-sm p-4 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Segnalazione inviata, grazie per il tuo contributo!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Scrivi qui un suggerimento, un problema riscontrato, o un'idea di miglioramento…"
        rows={4}
        required
        className="w-full rounded-xl bg-base-850 border border-base-700 px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-accent"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="La tua email (opzionale, se vuoi una risposta)"
        className="w-full rounded-xl bg-base-850 border border-base-700 px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
      />
      {error && <p className="text-xs text-bad">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="flex items-center justify-center gap-2 rounded-xl bg-accent text-base-950 font-medium py-2.5 disabled:opacity-50"
      >
        {status === "sending" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Invia segnalazione
      </button>
    </form>
  );
}
