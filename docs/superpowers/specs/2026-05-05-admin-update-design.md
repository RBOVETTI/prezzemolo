# Admin Update Mailer — Design Spec
Date: 2026-05-05

## Obiettivo
Aggiungere una pagina admin protetta da password che permette di inviare email di aggiornamento ai lead che hanno scaricato un documento specifico.

---

## Architettura

### File nuovi
- `src/pages/AdminPage.jsx` — pagina admin React
- `api/verify-admin.js` — verifica password admin
- `api/get-leads.js` — legge i lead da Google Sheets
- `api/send-update.js` — invia email di aggiornamento

### File modificati
- `src/components/Header.jsx` — aggiunge bottone ↑ (arrow-up) che naviga a `/admin`
- `src/App.jsx` — aggiunge route `/admin` → `<AdminPage />`

### Env var nuova
- `ADMIN_PASSWORD` — stringa password, configurata nelle env var di Vercel

---

## Flusso utente

1. L'utente clicca il bottone ↑ nell'header
2. Viene navigato a `/admin`
3. Appare una modale di login con campo password
4. La password viene verificata via `POST /api/verify-admin`
5. Se errata: messaggio di errore
6. Se corretta: la modale sparisce, si carica la pagina admin
7. La pagina fetcha `GET /api/get-leads` e popola il dropdown
8. L'utente seleziona un documento dal dropdown
9. La lista dei lead si popola (con checkbox ON di default)
10. L'utente deseleziona eventuali lead da escludere
11. L'utente scrive il commento di aggiornamento nella textarea
12. L'utente clicca "Invia aggiornamento"
13. Il client chiama `POST /api/send-update`
14. Feedback visivo: "Inviate X email con successo"

---

## UI Layout

Layout a 2 colonne:

```
┌─────────────────────────────────────────────────────┐
│  Dropdown: [seleziona documento ▼]                   │
├──────────────────────┬──────────────────────────────┤
│  Lista lead          │  Commento aggiornamento       │
│                      │                               │
│  ☑ Mario Rossi       │  ┌──────────────────────┐    │
│    mario@esempio.it  │  │ scrivi il commento   │    │
│    Azienda X         │  │ per i tuoi lettori   │    │
│                      │  └──────────────────────┘    │
│  ☑ Giulia Bianchi    │                               │
│    giulia@esempio.it │  [Invia aggiornamento ↑]      │
│                      │                               │
└──────────────────────┴──────────────────────────────┘
```

Il bottone "Invia aggiornamento" è disabilitato se:
- nessun documento selezionato
- nessun lead selezionato (tutti deselezionati)
- textarea vuota

---

## API

### POST /api/verify-admin
**Request:** `{ password: string }`
**Response 200:** `{ ok: true }`
**Response 401:** `{ error: "Password non valida" }`

Confronta `password` con `process.env.ADMIN_PASSWORD`.

---

### GET /api/get-leads
**Response 200:**
```json
{
  "Titolo Articolo A": [
    { "name": "Mario Rossi", "email": "mario@esempio.it", "company": "Azienda X", "role": "CTO" }
  ],
  "Titolo Articolo B": [...]
}
```

Legge `Leads!A:F` da Google Sheets (stesso `GOOGLE_SHEETS_ID` usato in `submit-lead.js`).
Colonne: A=timestamp, B=name, C=email, D=company, E=role, F=articleTitle.
Raggruppa per articleTitle. Rimuove duplicati per email (mantiene l'entry più recente).

---

### POST /api/send-update
**Request:**
```json
{
  "articleTitle": "Titolo Articolo",
  "pdfUrl": "https://writing.rbovetti.com/articles/NOME.pdf",
  "message": "Abbiamo aggiornato il documento perché...",
  "leads": [
    { "name": "Mario Rossi", "email": "mario@esempio.it" }
  ]
}
```
**Response 200:** `{ sent: 3 }`
**Response 500:** `{ error: "..." }`

Per ogni lead invia un'email personalizzata con Nodemailer (stesso transporter di `submit-lead.js`).

Il `pdfUrl` è costruito lato client: `AdminPage` fetcha `/articles.json`, trova l'articolo per titolo, recupera `options.find(o => o.type === 'protected-download').file` e costruisce `window.location.origin + file` — stesso pattern di `LeadGenModal.jsx`.

---

## Template email aggiornamento

Stesso HTML template di `sendEmailToUser` in `submit-lead.js`, con queste varianti:

| Campo | Email originale | Email aggiornamento |
|---|---|---|
| Subject | `Il tuo documento: ${title}` | `Aggiornamento disponibile: ${title}` |
| Intro | `Grazie per il tuo interesse` | `Abbiamo aggiornato il documento che hai scaricato` |
| Corpo aggiuntivo | — | `${message}` (commento dell'admin) |
| Testo bottone | `Scarica il PDF` | `Scarica la versione aggiornata` |
| URL bottone | pdfUrl | pdfUrl (stesso link diretto) |

---

## Considerazioni di sicurezza

- La password non viene mai inviata in chiaro nel corpo della response
- L'endpoint `/api/verify-admin` non rivela se la password è "quasi giusta"
- La sessione admin è mantenuta solo in React state (persa al reload — comportamento intenzionale)
- Gli endpoint `/api/get-leads` e `/api/send-update` non verificano autonomamente la password (è responsabilità del client averla già verificata). Accettabile per uso personale/admin.
