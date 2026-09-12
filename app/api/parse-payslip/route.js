// Su Netlify questa route diventa una Netlify Function (Next.js App Router
// è supportato nativamente da @netlify/plugin-nextjs, vedi netlify.toml).
export const runtime = "nodejs";
export const maxDuration = 60;

// Questo endpoint fa UNA sola cosa: manda il documento a Google Gemini e
// restituisce il JSON estratto. Il salvataggio dei dati avviene interamente
// lato client, in IndexedDB (nel browser stesso) — nessun database esterno.
//
// Usiamo l'API REST di Gemini con una semplice fetch, senza SDK aggiuntivi:
// meno dipendenze da mantenere aggiornate nel tempo.

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `Sei un motore di estrazione dati altamente accurato specializzato in buste paga italiane (CCNL Metalmeccanica Industria). Estrai tutti i dati contrattuali, orari, saldi ratei (ferie, ROL, flessibilità), TFR e progressivi fiscali dal documento ed emetti ESCLUSIVAMENTE un JSON valido senza markdown o testo introduttivo, seguendo esattamente questo schema (usa null per i valori non presenti nel documento, non inventare mai numeri):

{
  "periodo": { "mese": number, "anno": number },
  "dati_contrattuali": {
    "ccnl": "Metalmeccanica Industria",
    "livello": string,
    "paga_oraria": number,
    "ore_ordinarie_mese": number,
    "giorni_lavorati": number
  },
  "retribuzione_fissa": {
    "minimo_tabellare": number,
    "scatti_anzianita": number,
    "indennita_mansione": number,
    "indennita_mensa": number,
    "totale_lordo_fisso": number
  },
  "voci_variabili": [
    { "descrizione": string, "importo_lordo": number }
  ],
  "welfare_e_ticket": {
    "giorni_ticket": number,
    "valore_unitario_ticket": number,
    "totale_ticket": number
  },
  "previdenza_e_fisco": {
    "imponibile_inps": number,
    "contributi_inps": number,
    "imponibile_irpef": number,
    "irpef_lorda": number,
    "detrazioni_lavoro_dipendente": number,
    "ulteriori_detrazioni": number,
    "irpef_netta": number,
    "addizionale_regionale": number,
    "addizionale_comunale": number,
    "totale_trattenute": number
  },
  "totali": {
    "lordo_totale": number,
    "netto_in_busta": number
  },
  "saldi_orari_ratei": {
    "ferie": {
      "residuo_anno_precedente_ore": number,
      "maturato_ore": number,
      "goduto_ore": number,
      "saldo_ore": number
    },
    "rol_par": {
      "residuo_anno_precedente_ore": number,
      "maturato_ore": number,
      "goduto_ore": number,
      "saldo_ore": number
    },
    "flessibilita_banca_ore": {
      "maturato_ore": number,
      "goduto_ore": number,
      "saldo_ore": number
    }
  },
  "progressivi_e_tfr": {
    "imponibile_inps_progressivo": number,
    "imponibile_irpef_progressivo": number,
    "irpef_pagata_progressiva": number,
    "retribuzione_utile_tfr": number,
    "tfr_trasferito_fondo": number
  }
}`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { fileBase64, mediaType } = body;

    if (!fileBase64 || !mediaType) {
      return Response.json(
        { error: "File mancante o tipo file non specificato." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY non configurata sul server. Impostala tra le variabili d'ambiente di Netlify." },
        { status: 500 }
      );
    }

    const requestBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [
            { inline_data: { mime_type: mediaType, data: fileBase64 } },
            {
              text: "Estrai i dati da questa busta paga secondo lo schema JSON indicato nelle istruzioni. Rispondi solo con il JSON.",
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0,
      },
    };

    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      const apiMessage = geminiData?.error?.message || "Errore sconosciuto dall'API Gemini.";
      return Response.json(
        { error: `Estrazione AI fallita (Gemini): ${apiMessage}` },
        { status: geminiRes.status }
      );
    }

    const candidate = geminiData?.candidates?.[0];
    const finishReason = candidate?.finishReason;

    if (finishReason === "SAFETY" || finishReason === "RECITATION") {
      return Response.json(
        { error: "Gemini ha bloccato la risposta per i suoi filtri di sicurezza. Prova con un altro file." },
        { status: 502 }
      );
    }

    const rawText = (candidate?.content?.parts || [])
      .map((part) => part.text || "")
      .join("\n")
      .trim();

    if (!rawText) {
      return Response.json(
        { error: "Gemini non ha restituito alcun testo. Riprova, oppure verifica la qualità della foto/scansione." },
        { status: 502 }
      );
    }

    // Rimuove eventuali fence markdown residui prima del parsing (Gemini di
    // solito rispetta response_mime_type "application/json", ma per sicurezza
    // ripuliamo comunque).
    const cleanJson = rawText.replace(/^```json\s*|\s*```$/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (err) {
      return Response.json(
        {
          error: "Gemini non ha restituito un JSON valido. Riprova, oppure verifica la qualità della foto/scansione.",
          raw: rawText,
        },
        { status: 502 }
      );
    }

    return Response.json({ success: true, parsed });
  } catch (err) {
    console.error("Errore /api/parse-payslip:", err);
    return Response.json(
      { error: err.message || "Errore interno del server durante l'estrazione AI." },
      { status: 500 }
    );
  }
}
