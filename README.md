# All you need is thought

Un sito web moderno e interattivo per condividere articoli con sistema di lead generation integrato, costruito con React.

## 🚀 Caratteristiche Principali

### Content Management
- 📚 **Organizzazione per topic e lingua** (Italiano/English)
- 🎨 **Design minimalista** con tema scuro (grigio #2e2e38 e oro #d4af37)
- 🔍 **Filtri dinamici** per topic e lingua
- 📄 **Opzioni multiple per articolo**: download diretto, carosello PDF, download protetto

### PDF Interattivi
- 📱 **Carosello PDF**: visualizza PDF pagina per pagina con navigazione tipo social
- 🖱️ **Swipe su mobile, frecce su desktop**
- 📏 **Dimensionamento responsive** automatico

### Lead Generation & GDPR
- 🔒 **Documenti protetti** con form di lead generation
- 📧 **Email automatiche** con Gmail SMTP
- 📊 **Salvataggio lead** su Google Sheets
- ⚖️ **GDPR compliant**: Privacy Policy completa, Cookie Banner, gestione consensi
- 🗑️ **Diritto all'oblio**: cancellazione automatica dati su richiesta

## 🛠️ Stack Tecnologico

- **React 18** + **React Router** - Framework UI con routing
- **Vite** - Build tool veloce
- **Tailwind CSS** - Utility-first CSS
- **react-pdf** - Rendering PDF
- **Vercel Functions** - API serverless
- **nodemailer** - Invio email
- **googleapis** - Integrazione Google Sheets

## 📦 Installazione

```bash
npm install
```

## ⚙️ Configurazione

### 1. Copia il file di configurazione

```bash
cp .env.example .env.local
```

### 2. Configura Gmail SMTP

1. Vai su [Google Account Security](https://myaccount.google.com/security)
2. Attiva la **verifica in due passaggi**
3. Vai su [App Passwords](https://myaccount.google.com/apppasswords)
4. Crea una nuova password per "Mail" su "Altro"
5. Copia la password (16 caratteri) in `.env.local`:

```env
GMAIL_USER=tuaemail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### 3. Configura Google Sheets API

#### 3.1 Crea un progetto Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto
3. Abilita **Google Sheets API**

#### 3.2 Crea un Service Account

1. Vai su "IAM e amministrazione" > "Account di servizio"
2. Clicca "Crea account di servizio"
3. Assegna un nome e descrizione
4. Salta i ruoli opzionali e clicca "Fine"

#### 3.3 Genera credenziali JSON

1. Clicca sull'account di servizio appena creato
2. Vai su "Chiavi" > "Aggiungi chiave" > "Crea nuova chiave"
3. Seleziona **JSON**
4. Il file JSON verrà scaricato automaticamente
5. Copia **tutto il contenuto** del JSON in `.env.local`:

```env
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...}
```

#### 3.4 Crea e configura il foglio Google Sheets

1. Crea un nuovo [Google Sheets](https://sheets.google.com)
2. Rinomina il foglio in **"Leads"**
3. Aggiungi gli header nella prima riga:

| A: Timestamp | B: Nome | C: Email | D: Azienda | E: Ruolo | F: Articolo |
|--------------|---------|----------|------------|----------|-------------|

4. Copia l'**ID del foglio** dall'URL:
   ```
   https://docs.google.com/spreadsheets/d/[QUESTO-E-L-ID]/edit
   ```

5. Condividi il foglio con l'email del service account (trovata nel JSON come `client_email`) con permessi di **Editor**

6. Aggiungi l'ID in `.env.local`:

```env
GOOGLE_SHEETS_ID=1abc123def456ghi789jkl012mno345pqr678stu
```

### 4. Configura URL del sito

```env
# In sviluppo:
NEXT_PUBLIC_SITE_URL=http://localhost:5173

# In produzione:
NEXT_PUBLIC_SITE_URL=https://tuosito.vercel.app
```

### 5. Configura Environment Variables su Vercel

1. Vai su Vercel Dashboard → Il tuo progetto
2. Settings → Environment Variables
3. Aggiungi TUTTE le variabili da `.env.local`

## 🎯 Come Aggiungere Articoli

### Articolo Pubblico (download libero)

```json
{
  "id": 1,
  "title": "Titolo articolo",
  "description": "Descrizione breve",
  "topic": "AI",
  "language": "it",
  "protected": false,
  "options": [
    {
      "type": "download",
      "label": "Download PDF",
      "file": "/articles/file.pdf"
    },
    {
      "type": "carousel",
      "label": "Sfoglia",
      "file": "/articles/file-carosello.pdf"
    }
  ]
}
```

### Articolo Protetto (con lead generation)

```json
{
  "id": 2,
  "title": "Titolo articolo protetto",
  "description": "Descrizione breve",
  "topic": "Finance",
  "language": "en",
  "protected": true,
  "valueProposition": "Scopri strategie avanzate...",
  "coverImage": "/covers/articolo.jpg",
  "benefits": [
    "Beneficio 1",
    "Beneficio 2",
    "Beneficio 3"
  ],
  "options": [
    {
      "type": "protected-download",
      "label": "Scarica il documento",
      "file": "/articles/file-protetto.pdf"
    }
  ]
}
```

### Campi Opzionali per Articoli Protetti

- **`valueProposition`**: Sottotitolo accattivante per il modal
- **`coverImage`**: Immagine di copertina (mettere in `/public/covers/`)
- **`benefits`**: Array di benefici (bullet points)

## 🚀 Sviluppo

```bash
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173) nel browser.

## 🏗️ Build

```bash
npm run build
```

I file ottimizzati saranno nella cartella `dist/`.

## 📤 Deploy su Vercel

1. Collega il repository GitHub a Vercel
2. Aggiungi le Environment Variables (vedi sopra)
3. Deploy automatico ad ogni push

## 📂 Struttura del Progetto

```
prezzemolo/
├── api/                          # Vercel Serverless Functions
│   ├── submit-lead.js           # Gestione form e invio email
│   └── unsubscribe.js           # Cancellazione dati GDPR
├── public/
│   ├── articles/                # File PDF
│   ├── covers/                  # Immagini cover (opzionale)
│   ├── articles.json            # Database articoli
│   └── articles-example.json    # Esempio struttura dati
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Filters.jsx
│   │   ├── ArticleCard.jsx      # Card con gestione opzioni
│   │   ├── Modal.jsx
│   │   ├── PDFCarousel.jsx      # Carosello PDF interattivo
│   │   ├── LeadGenModal.jsx     # Form lead generation
│   │   └── CookieBanner.jsx     # Banner cookies GDPR
│   ├── pages/
│   │   ├── HomePage.jsx         # Pagina principale
│   │   └── PrivacyPolicy.jsx    # Privacy Policy completa
│   ├── App.jsx                  # Router principale
│   ├── main.jsx
│   └── index.css
├── .env.example                  # Template configurazione
├── package.json
└── README.md
```

## 🔒 GDPR Compliance

Il sistema è completamente conforme al GDPR:

### ✅ Privacy Policy
- Pagina completa con tutti i dettagli richiesti
- Accessibile da `/privacy-policy`
- Link presente nel footer e nei form

### ✅ Cookie Banner
- Banner minimalista per cookie tecnici
- Consenso salvato in localStorage
- Link alla Privacy Policy

### ✅ Consenso Esplicito
- Checkbox obbligatoria nel form
- Salvataggio solo con consenso
- Email con link alla privacy policy

### ✅ Diritto all'Oblio
- Link "Cancella i miei dati" in ogni email
- API `/api/unsubscribe` per cancellazione automatica
- Rimozione immediata da Google Sheets

## 📧 Flusso Email

### Email all'utente (automatica dopo form)
- Ringraziamento personalizzato
- Link diretto al PDF
- Link alla Privacy Policy
- Link per cancellazione dati

### Email al proprietario (notifica nuovo lead)
- Dati del lead raccolti
- Articolo richiesto
- Timestamp

## 🎨 Personalizzazione

### Modificare i Colori

Modifica `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#d4af37',        // Oro
      'primary-dark': '#b8941f', // Oro scuro
      dark: '#2e2e38',           // Grigio scuro
      // ...
    },
  },
}
```

### Modificare Titolo e Sottotitolo

Modifica `src/components/Header.jsx`:

```jsx
<h1>Il Tuo Titolo</h1>
<p>La tua descrizione</p>
```

## 🐛 Troubleshooting

### Email non arrivano
- Verifica che la Gmail App Password sia corretta
- Controlla che non ci siano spazi nella password
- Verifica che la verifica in due passaggi sia attiva

### Google Sheets non si aggiorna
- Verifica che il foglio sia condiviso con il service account
- Controlla che l'ID del foglio sia corretto
- Verifica che il foglio si chiami esattamente "Leads"
- Controlla i permessi (deve essere "Editor")

### Build fallisce
- Esegui `npm install` per verificare le dipendenze
- Controlla che tutte le variabili d'ambiente siano configurate

## 📄 Licenza

Tutti i diritti riservati © 2025
