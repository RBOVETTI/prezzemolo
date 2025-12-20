# Biblioteca Articoli

Un sito web semplice e pulito per condividere articoli organizzati per topic e lingua.

## Caratteristiche

- 📚 Organizzazione per topic e lingua (Italiano/English)
- 🎨 Design minimalista e pulito
- 🔍 Filtri dinamici per topic e lingua
- 📱 Responsive design
- ⚡ Leggero e veloce (solo HTML, CSS, JavaScript vanilla)

## Struttura del Progetto

```
prezzemolo/
├── index.html          # Pagina principale
├── style.css           # Stili CSS
├── app.js              # JavaScript per filtri e caricamento
├── articles.json       # Database degli articoli
└── articles/           # Cartella contenente i file PDF/documenti
```

## Come Aggiungere Nuovi Articoli

1. Carica il file PDF/documento nella cartella `articles/`

2. Aggiungi una nuova voce nel file `articles.json`:

```json
{
  "id": 5,
  "title": "Titolo del tuo articolo",
  "description": "Breve descrizione dell'articolo (2-3 righe)",
  "topic": "Nome del Topic",
  "language": "it",
  "file": "articles/nome-file.pdf"
}
```

**Nota:** Usa `"language": "it"` per italiano e `"language": "en"` per inglese.

## Come Usare

1. Apri `index.html` in un browser web
2. Usa i filtri per visualizzare articoli per topic o lingua
3. Clicca su "Download" per scaricare un articolo

## Hosting

Per pubblicare il sito online, puoi usare servizi gratuiti come:

- **GitHub Pages**: Ideale per siti statici
- **Netlify**: Deploy automatico dal repository
- **Vercel**: Hosting veloce e gratuito

## Personalizzazione

### Modificare i Colori

Modifica le variabili CSS nel file `style.css`:

```css
:root {
    --primary-color: #2c3e50;
    --accent-color: #3498db;
    /* ... altri colori ... */
}
```

### Modificare il Titolo e Sottotitolo

Modifica il file `index.html`:

```html
<h1>Il Tuo Titolo</h1>
<p class="subtitle">La tua descrizione</p>
```

## Tecnologie Utilizzate

- HTML5
- CSS3 (con CSS Grid e Flexbox)
- JavaScript Vanilla (ES6+)
- JSON per la gestione dei dati
