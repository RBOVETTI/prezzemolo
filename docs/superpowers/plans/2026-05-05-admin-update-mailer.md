# Admin Update Mailer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere una pagina admin protetta da password che permette di inviare email di aggiornamento ai lead che hanno scaricato un documento specifico.

**Architecture:** Tre nuovi endpoint Vercel serverless (`verify-admin`, `get-leads`, `send-update`) più una pagina React `/admin` protetta da password. La password è verificata lato server tramite env var `ADMIN_PASSWORD`. Il bottone admin (↑) viene aggiunto nell'`Header.jsx` esistente.

**Tech Stack:** React 19, React Router v7, Vercel serverless functions, Nodemailer, Google Sheets API v4, Tailwind CSS.

---

## File Map

| File | Azione | Responsabilità |
|---|---|---|
| `api/verify-admin.js` | Crea | Verifica password contro `ADMIN_PASSWORD` env var |
| `api/get-leads.js` | Crea | Legge Google Sheets, raggruppa lead per articleTitle |
| `api/send-update.js` | Crea | Invia email personalizzate con Nodemailer |
| `src/pages/AdminPage.jsx` | Crea | UI admin: dropdown, lista lead, textarea, invio |
| `src/components/Header.jsx` | Modifica | Aggiunge bottone ↑ che naviga a `/admin` |
| `src/App.jsx` | Modifica | Aggiunge route `/admin` → `<AdminPage />` |

---

## Task 1: api/verify-admin.js

**Files:**
- Create: `api/verify-admin.js`

- [ ] **Step 1: Crea il file**

```javascript
// api/verify-admin.js
export const config = { api: { bodyParser: true } };

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Password non valida' });
  }
  return res.status(200).json({ ok: true });
}
```

- [ ] **Step 2: Aggiungi `ADMIN_PASSWORD` nelle env var Vercel**

Nel pannello Vercel → Settings → Environment Variables, aggiungi:
- Key: `ADMIN_PASSWORD`
- Value: la password che vuoi usare
- Environments: Production, Preview

In locale per testare, crea/aggiorna `.env.local` (se non esiste) con:
```
ADMIN_PASSWORD=latuapassword
```

- [ ] **Step 3: Testa l'endpoint in locale con `vercel dev`**

Avvia il server locale:
```bash
vercel dev
```

Test con password corretta (sostituisci `latuapassword` con quella reale):
```bash
curl -X POST http://localhost:3000/api/verify-admin \
  -H "Content-Type: application/json" \
  -d '{"password":"latuapassword"}'
```
Output atteso: `{"ok":true}`

Test con password errata:
```bash
curl -X POST http://localhost:3000/api/verify-admin \
  -H "Content-Type: application/json" \
  -d '{"password":"sbagliata"}'
```
Output atteso: `{"error":"Password non valida"}` con status 401

- [ ] **Step 4: Commit**

```bash
git add api/verify-admin.js
git commit -m "feat: aggiunge endpoint verify-admin"
```

---

## Task 2: api/get-leads.js

**Files:**
- Create: `api/get-leads.js`

- [ ] **Step 1: Crea il file**

```javascript
// api/get-leads.js
import { google } from 'googleapis';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Leads!A:F',
    });

    const rows = response.data.values || [];

    // Raggruppa per articleTitle (col F), deduplica per email (vince l'entry più recente)
    const grouped = {};
    for (const row of rows) {
      const [, name, email, company, role, articleTitle] = row;
      if (!articleTitle || !email) continue;

      if (!grouped[articleTitle]) grouped[articleTitle] = {};
      grouped[articleTitle][email] = {
        name: name || '',
        email,
        company: company || '',
        role: role || '',
      };
    }

    const result = {};
    for (const [title, emailMap] of Object.entries(grouped)) {
      result[title] = Object.values(emailMap);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Errore get-leads:', error);
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  }
}
```

- [ ] **Step 2: Testa l'endpoint in locale**

(Con `vercel dev` già avviato)
```bash
curl http://localhost:3000/api/get-leads
```
Output atteso: oggetto JSON con chiavi = titoli degli articoli, valori = array di lead.
Esempio:
```json
{
  "Mappa Concettuale AI": [
    { "name": "Mario Rossi", "email": "mario@esempio.it", "company": "Azienda X", "role": "CTO" }
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add api/get-leads.js
git commit -m "feat: aggiunge endpoint get-leads"
```

---

## Task 3: api/send-update.js

**Files:**
- Create: `api/send-update.js`

- [ ] **Step 1: Crea il file**

```javascript
// api/send-update.js
import nodemailer from 'nodemailer';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { articleTitle, pdfUrl, message, leads } = req.body;

  if (!articleTitle || !pdfUrl || !message || !Array.isArray(leads) || leads.length === 0) {
    return res.status(400).json({ error: 'Dati mancanti' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    for (const lead of leads) {
      await sendUpdateEmail(transporter, { ...lead, articleTitle, pdfUrl, message });
    }
    return res.status(200).json({ sent: leads.length });
  } catch (error) {
    console.error('Errore send-update:', error);
    return res.status(500).json({ error: 'Errore del server', details: error.message });
  }
}

async function sendUpdateEmail(transporter, { name, email, articleTitle, pdfUrl, message }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://writing.rbovetti.com';

  await transporter.sendMail({
    from: `"All you need is thought" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Aggiornamento disponibile: ${articleTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #2e2e38; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2e2e38; color: #d4af37; padding: 30px; text-align: center; }
          .content { padding: 30px; background-color: #f8f9fa; }
          .button { display: inline-block; padding: 15px 30px; background-color: #d4af37; color: #2e2e38; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .update-box { background-color: #fff; border-left: 4px solid #d4af37; padding: 15px 20px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .footer a { color: #d4af37; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>All you need is thought</h1>
          </div>
          <div class="content">
            <h2>Ciao ${name}!</h2>
            <p>Abbiamo aggiornato il documento che hai scaricato:</p>
            <h3>${articleTitle}</h3>
            <div class="update-box">
              <p>${message}</p>
            </div>
            <p style="text-align: center;">
              <a href="${pdfUrl}" class="button">Scarica la versione aggiornata</a>
            </p>
          </div>
          <div class="footer">
            <p>Hai ricevuto questa email perché hai in precedenza scaricato questo documento.</p>
            <p>
              <a href="${siteUrl}/privacy-policy">Privacy Policy</a> |
              <a href="${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}">Cancella i miei dati</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
```

- [ ] **Step 2: Testa l'endpoint in locale con un lead reale**

Sostituisci `TITOLO_ARTICOLO`, `TUO_NOME` e `TUA_EMAIL` con valori reali presenti nel tuo Sheets:
```bash
curl -X POST http://localhost:3000/api/send-update \
  -H "Content-Type: application/json" \
  -d '{
    "articleTitle": "TITOLO_ARTICOLO",
    "pdfUrl": "https://writing.rbovetti.com/articles/NOMEFILE.pdf",
    "message": "Test di aggiornamento dal piano di implementazione.",
    "leads": [{"name": "TUO_NOME", "email": "TUA_EMAIL"}]
  }'
```
Output atteso: `{"sent":1}`
Verifica di ricevere l'email nel formato corretto.

- [ ] **Step 3: Commit**

```bash
git add api/send-update.js
git commit -m "feat: aggiunge endpoint send-update"
```

---

## Task 4: src/pages/AdminPage.jsx

**Files:**
- Create: `src/pages/AdminPage.jsx`

- [ ] **Step 1: Crea il file**

```jsx
// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [leadsData, setLeadsData] = useState({});
  const [articlesData, setArticlesData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState('');
  const [selectedLeads, setSelectedLeads] = useState({});
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  useEffect(() => {
    if (selectedArticle && leadsData[selectedArticle]) {
      const defaults = {};
      leadsData[selectedArticle].forEach(l => { defaults[l.email] = true; });
      setSelectedLeads(defaults);
    } else {
      setSelectedLeads({});
    }
    setSendResult(null);
  }, [selectedArticle, leadsData]);

  async function loadData() {
    setLoading(true);
    try {
      const [leadsRes, articlesRes] = await Promise.all([
        fetch('/api/get-leads'),
        fetch('/articles.json'),
      ]);
      const leads = await leadsRes.json();
      const articles = await articlesRes.json();
      setLeadsData(leads);
      setArticlesData(articles.articles || []);
    } catch (err) {
      console.error('Errore caricamento dati:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAuth(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
      } else {
        setAuthError('Password non valida');
      }
    } catch {
      setAuthError('Errore di connessione');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSend() {
    const activeLeads = (leadsData[selectedArticle] || []).filter(l => selectedLeads[l.email]);
    const article = articlesData.find(a => a.title === selectedArticle);
    const protectedOpt = article?.options?.find(o => o.type === 'protected-download');
    const pdfUrl = window.location.origin + protectedOpt?.file;

    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/send-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: selectedArticle,
          pdfUrl,
          message,
          leads: activeLeads.map(l => ({ name: l.name, email: l.email })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendResult({ ok: true, count: data.sent });
        setMessage('');
      } else {
        setSendResult({ ok: false, error: data.error });
      }
    } catch {
      setSendResult({ ok: false, error: 'Errore di connessione' });
    } finally {
      setSending(false);
    }
  }

  const currentLeads = leadsData[selectedArticle] || [];
  const activeCount = Object.values(selectedLeads).filter(Boolean).length;
  const canSend = selectedArticle && activeCount > 0 && message.trim().length > 0;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-serif font-medium text-accent-warm mb-6 text-center">Area Admin</h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-accent-cold/20 rounded focus:outline-none focus:border-accent-cold"
                autoFocus
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading || !password}
              className="w-full py-3 bg-accent-warm text-white font-medium rounded hover:bg-accent-warm/90 disabled:opacity-50"
            >
              {authLoading ? 'Verifica...' : 'Accedi'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg pt-32 md:pt-36 pb-16">
      <div className="container mx-auto px-5 max-w-6xl">
        <h2 className="text-3xl font-serif font-medium text-accent-warm mb-8">Invia aggiornamento</h2>

        {loading ? (
          <p className="text-text-secondary">Caricamento dati...</p>
        ) : (
          <>
            <div className="mb-8">
              <label className="block text-sm font-medium text-text-primary mb-2">Documento</label>
              <select
                value={selectedArticle}
                onChange={e => setSelectedArticle(e.target.value)}
                className="w-full md:w-1/2 px-4 py-2 border border-accent-cold/20 rounded bg-white focus:outline-none focus:border-accent-cold"
              >
                <option value="">-- seleziona documento --</option>
                {Object.keys(leadsData).map(title => (
                  <option key={title} value={title}>
                    {title} ({leadsData[title].length})
                  </option>
                ))}
              </select>
            </div>

            {selectedArticle && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-text-primary mb-3">
                    Lead ({activeCount}/{currentLeads.length} selezionati)
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {currentLeads.map(lead => (
                      <label
                        key={lead.email}
                        className="flex items-start gap-3 p-3 bg-white rounded border border-accent-cold/10 cursor-pointer hover:border-accent-cold/30"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLeads[lead.email] ?? true}
                          onChange={e =>
                            setSelectedLeads(prev => ({ ...prev, [lead.email]: e.target.checked }))
                          }
                          className="mt-1 accent-accent-warm"
                        />
                        <div>
                          <p className="font-medium text-text-primary text-sm">{lead.name}</p>
                          <p className="text-text-secondary text-xs">{lead.email}</p>
                          {lead.company && (
                            <p className="text-text-secondary text-xs">{lead.company}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Commento aggiornamento
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={8}
                      placeholder="Descrivi cosa è cambiato nel documento..."
                      className="w-full px-4 py-3 border border-accent-cold/20 rounded focus:outline-none focus:border-accent-cold resize-none"
                    />
                  </div>

                  {sendResult && (
                    <p className={sendResult.ok ? 'text-green-600 font-medium' : 'text-red-500'}>
                      {sendResult.ok
                        ? `✓ Inviate ${sendResult.count} email con successo`
                        : `Errore: ${sendResult.error}`}
                    </p>
                  )}

                  <button
                    onClick={handleSend}
                    disabled={!canSend || sending}
                    className="px-6 py-3 bg-accent-warm text-white font-medium rounded hover:bg-accent-warm/90 disabled:opacity-50 disabled:cursor-not-allowed self-start"
                  >
                    {sending ? 'Invio in corso...' : `Invia aggiornamento (${activeCount})`}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/AdminPage.jsx
git commit -m "feat: aggiunge AdminPage"
```

---

## Task 5: Header.jsx + App.jsx + test end-to-end

**Files:**
- Modify: `src/components/Header.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Aggiorna Header.jsx**

Sostituisci l'intero contenuto del file con:

```jsx
// src/components/Header.jsx
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-bg border-b border-accent-cold/10 py-8 z-40">
      <div className="container mx-auto px-5 max-w-6xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-light text-text-primary mb-1 tracking-wide">
            All you need is thought
          </h1>
          <p className="text-text-secondary text-sm md:text-base font-serif">
            di Riccardo Bovetti
          </p>
          <p className="text-text-secondary text-base md:text-lg font-serif italic">
            Una raccolta di testicoli variegati (intesi come piccoli testi, naturalmente)
          </p>
        </div>

        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          {/* Bottone admin */}
          <button
            onClick={() => navigate('/admin')}
            title="Area admin"
            className="text-text-secondary hover:text-accent-warm transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 md:w-6 md:h-6"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>

          {/* Torna a rbovetti.com */}
          <a
            href="https://www.rbovetti.com"
            title="Torna a rbovetti.com"
            className="text-text-secondary hover:text-accent-warm transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 md:w-6 md:h-6"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Aggiorna App.jsx**

Sostituisci l'intero contenuto del file con:

```jsx
// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
```

- [ ] **Step 3: Test end-to-end in locale**

Avvia il dev server (con `vercel dev` per avere le API attive):
```bash
vercel dev
```

Checklist manuale:
1. Vai su `http://localhost:3000` — verifica che il bottone ↑ sia visibile nell'header accanto al bottone home
2. Clicca il bottone ↑ — devi essere reindirizzato a `/admin` con il form di login
3. Inserisci una password sbagliata — deve apparire "Password non valida"
4. Inserisci la password corretta — deve sparire il form e comparire la pagina admin
5. Il dropdown deve mostrare i titoli degli articoli con il conteggio lead
6. Seleziona un articolo — la lista dei lead deve popolarsi con tutte le checkbox ON
7. Deseleziona un lead — il contatore nel bottone deve aggiornarsi
8. Svuota la textarea — il bottone "Invia aggiornamento" deve essere disabilitato
9. Scrivi un messaggio e clicca il bottone — deve mostrare "Inviate X email con successo"
10. Verifica di ricevere le email nel formato corretto

- [ ] **Step 4: Commit e push**

```bash
git add src/components/Header.jsx src/App.jsx
git commit -m "feat: aggiunge bottone admin in header e route /admin"
git push
```

Vercel rileverà il push e farà il build automaticamente. Dopo il deploy, verifica tutto anche in produzione su `https://writing.rbovetti.com/admin`.
