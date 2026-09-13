# Buste Paga PWA — versione locale (senza account, senza Supabase)

Versione semplificata dell'app pensata per essere provata facilmente da chiunque:
carica una busta paga (PDF o foto), l'AI ne estrae i dati, e tutto viene mostrato
in una dashboard con grafici — **senza creare nessun account** oltre alla chiave
Gemini gratuita.

## ⚠️ Come funziona il salvataggio (leggi prima di usarla)

Questa versione **non ha un database esterno**: tutti i dati (buste paga, file
PDF/foto originali) vengono salvati **direttamente nel browser** di chi la usa,
tramite IndexedDB (una tecnologia di salvataggio locale del browser).

Conseguenze pratiche:
- **Ogni persona che apre il sito ha i propri dati**, isolati dagli altri — perfetto per farla provare a più amici senza che si mescolino le buste paga di ciascuno
- **Nessuna sincronizzazione tra dispositivi**: se apri il sito dal telefono e poi dal computer, sono due "magazzini" di dati separati
- **I dati si perdono** se: si cancellano i dati di navigazione del browser, si disinstalla l'app, si usa la modalità navigazione in incognito, o si cambia browser/dispositivo
- Nelle Impostazioni c'è un pulsante **"Esporta backup"** che scarica un file JSON con tutti i numeri estratti (non i file PDF/foto originali) — usalo come rete di sicurezza se vuoi conservare lo storico a lungo termine

Se in futuro servisse la sincronizzazione multi-dispositivo con dati persistenti, esiste una versione "cloud" dello stesso progetto basata su Supabase.

## 1. Chiave API Google Gemini (gratuita, unico requisito)

1. Vai su [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) e accedi con un account Google
2. Clicca **"Create API key"** e copiala
3. L'app usa il modello `gemini-3.6-flash`, che rientra nella fascia gratuita di Google per un uso personale/di prova

   > ⚠️ **Nota sulla privacy**: con la chiave gratuita, Google può usare i contenuti che invii (le buste paga) per migliorare i propri modelli. Se questo non va bene per te o per chi proverà l'app, attiva la fatturazione su Google AI Studio (il costo resta comunque minimo) prima di condividere il link.

## 2. Chiave API Resend (per le Segnalazioni, gratuita)

1. Vai su [resend.com](https://resend.com) e crea un account gratuito
2. **API Keys** → **Create API Key**, copiala
3. Serve solo per il pulsante "Invia segnalazione" nelle Impostazioni: senza questa chiave, quel form non funziona (il resto dell'app funziona comunque)
4. Le email partono dal mittente di test `onboarding@resend.dev`, che non richiede la verifica di un dominio proprio

## 3. Sviluppo locale

```bash
npm install
cp .env.example .env.local   # inserisci GEMINI_API_KEY (e RESEND_API_KEY se vuoi testare le Segnalazioni)
npm run dev
```

Apri `http://localhost:3000`.

## 4. Deploy gratuito su Netlify

### Da GitHub (consigliata)
1. Crea un repository su GitHub e carica tutti i file di questo progetto
2. Su [app.netlify.com](https://app.netlify.com) → **Add new site > Import an existing project** → collega GitHub e seleziona il repo (Netlify riconosce Next.js automaticamente grazie a `netlify.toml`)
3. Prima del deploy, vai su **Site configuration > Environment variables** e aggiungi:

   | Variabile | Obbligatoria? | Valore |
   |---|---|---|
   | `GEMINI_API_KEY` | Sì | la tua chiave Gemini |
   | `RESEND_API_KEY` | Solo per le Segnalazioni | la tua chiave Resend |
4. Avvia il deploy

### Da CLI (richiede Node.js in locale)
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set GEMINI_API_KEY xxxxxxxx...
netlify env:set RESEND_API_KEY re_xxxxxxxx...
netlify deploy --prod
```

## 5. Condividerla con gli amici

Basta mandare il link Netlify (es. `https://tuo-sito.netlify.app`). Ognuno che lo apre:
- Non deve creare nessun account
- Può caricare le proprie buste paga da subito
- Può installarla come app dalla schermata Impostazioni ("Installa l'app su questo dispositivo")
- Ha i propri dati isolati, salvati solo sul proprio dispositivo (vedi avviso sopra)

## Funzionalità incluse

Stessa interfaccia della versione completa:
- **Dashboard**: ultimo netto, netto medio, lordo medio mensile, grafico Netto/Lordo, storico
- **Ferie/ROL**: saldo combinato, saldi singoli, banca ore, grafici
- **RAL**: RAL reale, RAL ipotetica con breakdown, paga oraria
- **Ticket**: totale, media mensile, dettaglio mese per mese
- **Documenti**: riapri i PDF/foto originali caricati
- **Menu anno** in alto a destra: filtra tutta l'app per anno
- **Eliminazione** busta paga dal dettaglio
- **Esporta backup** ed **Installazione PWA** dalle Impostazioni
- **Caricamento multiplo**: seleziona più PDF o foto insieme, l'app li elabora uno alla volta con barra di avanzamento
- **Segnalazioni**: form nelle Impostazioni per mandare suggerimenti/problemi via email
- **Mensilità RAL configurabili** (12/13/14) dalle Impostazioni
- **Proiezione Ferie/ROL a fine anno**: riquadro dedicato nella pagina Ferie/ROL

## Struttura del progetto

```
app/
  api/parse-payslip/route.js   # SOLO estrazione AI (Gemini) — nessun salvataggio qui
  page.jsx, ferie-rol/, ral/, buoni-pasto/, documenti/, settings/
  layout.jsx, globals.css
components/                     # stessa UI della versione completa
context/
  PayslipsContext.jsx            # stato globale: legge/scrive in IndexedDB
lib/
  localDb.js                      # wrapper IndexedDB (salvataggio locale nel browser)
  mapPayslip.js, ral.js, buoniPasto.js, format.js, useInstallPrompt.js
netlify.toml
```

## Nota

Il modello usato per l'estrazione è `gemini-3.6-flash`; per cambiarlo modifica la costante `GEMINI_MODEL` in `app/api/parse-payslip/route.js`.
