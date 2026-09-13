// Invia le segnalazioni scritte dagli utenti nelle Impostazioni all'indirizzo
// email del gestore dell'app, tramite l'API di Resend (servizio esterno di
// invio email, con una fascia gratuita generosa). La chiave RESEND_API_KEY
// resta sempre segreta lato server.
export const runtime = "nodejs";

const DESTINATARIO = "form.segnalazioni@gmail.com";

export async function POST(request) {
  try {
    const { message, replyTo } = await request.json();

    if (!message || !message.trim()) {
      return Response.json({ error: "Il messaggio è vuoto." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "RESEND_API_KEY non configurata sul server." },
        { status: 500 }
      );
    }

    const payload = {
      from: "Buste Paga App <onboarding@resend.dev>",
      to: [DESTINATARIO],
      subject: "Nuova segnalazione dall'app Buste Paga",
      text: `${message.trim()}${replyTo ? `\n\n---\nEmail per risposta: ${replyTo}` : ""}`,
    };
    if (replyTo) payload.reply_to = replyTo;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(
        { error: data?.message || "Errore durante l'invio della segnalazione." },
        { status: res.status }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { error: err.message || "Errore interno del server durante l'invio." },
      { status: 500 }
    );
  }
}
