# Biblioteca Articoli

Un sito web moderno e interattivo per condividere articoli organizzati per topic e lingua, costruito con React.

## Caratteristiche

- 📚 Organizzazione per topic e lingua (Italiano/English)
- 🎨 Design minimalista con tema scuro (grigio #2e2e38 e oro #d4af37)
- 🔍 Filtri dinamici per topic e lingua
- 📄 **Opzioni multiple per articolo**: download diretto, carosello PDF, e altro
- 📱 **Carosello PDF interattivo**: visualizza PDF pagina per pagina con navigazione tipo social
- 🖱️ Swipe su mobile, frecce su desktop
- ⚡ Build veloce con Vite
- 🎯 React 18 + Tailwind CSS

## Stack Tecnologico

- **React 18** - Framework UI
- **Vite** - Build tool veloce
- **Tailwind CSS** - Utility-first CSS
- **react-pdf** - Rendering PDF
- **pdfjs-dist** - PDF.js per visualizzazione PDF

## Installazione

```bash
npm install
```

## Sviluppo

```bash
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173) nel browser.

## Build

```bash
npm run build
```

I file ottimizzati saranno nella cartella `dist/`.

## Preview Build

```bash
npm run preview
```

## Come Aggiungere Nuovi Articoli

1. Carica il file PDF nella cartella `public/articles/`

2. Aggiungi una nuova voce nel file `public/articles.json`:

```json
{
  "id": 2,
  "title": "Titolo del tuo articolo",
  "description": "Breve descrizione dell'articolo (2-3 righe)",
  "topic": "Nome del Topic",
  "language": "it",
  "options": [
    {
      "type": "download",
      "label": "Download PDF",
      "file": "/articles/nome-file.pdf"
    },
    {
      "type": "carousel",
      "label": "Sfoglia",
      "file": "/articles/nome-file-carousel.pdf"
    }
  ]
}
```

### Tipi di Opzioni Disponibili

- **`download`**: Apre il PDF per il download diretto
- **`carousel`**: Apre il PDF in un modal con navigazione pagina per pagina (perfetto per presentazioni o documenti da sfogliare)

**Nota:**
- Usa `"language": "it"` per italiano e `"language": "en"` per inglese
- Puoi avere un numero variabile di opzioni per ogni articolo
- Il carosello è ottimizzato per PDF in formato quadrato (come post Instagram)

## Personalizzazione

### Modificare i Colori

Modifica le variabili in `tailwind.config.js`:

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

### Modificare il Titolo e Sottotitolo

Modifica `src/components/Header.jsx`:

```jsx
<h1>Il Tuo Titolo</h1>
<p>La tua descrizione</p>
```

## Deploy su Vercel

Il sito è già configurato per Vercel. Basta collegare il repository GitHub a Vercel e il deploy sarà automatico.

## Struttura del Progetto

```
prezzemolo/
├── public/
│   ├── articles/           # File PDF
│   └── articles.json       # Database articoli
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Filters.jsx
│   │   ├── ArticleCard.jsx
│   │   ├── Modal.jsx
│   │   └── PDFCarousel.jsx
│   ├── App.jsx            # Componente principale
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js
└── vite.config.js
```

## Licenza

Tutti i diritti riservati © 2025
