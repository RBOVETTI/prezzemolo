# SEO Strategy — "All you need is thought" (writing.rbovetti.com)

**Data:** 2026-05-11  
**Autore:** Riccardo Bovetti  
**Obiettivo:** Visibilità come thought leader + opportunità di collaborazioni accademiche  
**Stack attuale:** React SPA + Vite + Tailwind + Vercel

---

## Problema principale

Il sito è una React SPA con una sola route indicizzabile (`/`). Google vede un'unica pagina contenente 19 articoli come card JavaScript — non può indicizzarli separatamente. Risultato: nessuna presenza nella SERP per keyword tematiche (AI governance, AI agents finance, ecc.) né per ricerche nominative ("Riccardo Bovetti paper").

---

## Obiettivi

- Ogni articolo appare individualmente nella SERP di Google con titolo, description e link diretto
- Ricerche per nome autore (`Riccardo Bovetti AI governance`) restituiscono risultati rilevanti
- I paper sono riconoscibili da motori accademici (Google Scholar, Semantic Scholar, Perplexity)
- LinkedIn resta il canale di amplificazione principale, ma ogni post punta a una pagina articolo specifica

---

## Architettura URL

```
/                          → Homepage (lista articoli, invariata visivamente)
/articles/[slug]           → Pagina articolo (IT + EN sulla stessa pagina con toggle lingua)
/about                     → Profilo accademico-professionale (nuova)
/privacy-policy            → (già esiste)
```

### Generazione slug

Lo slug è generato dal titolo principale (italiano se disponibile, inglese altrimenti) tramite:
- lowercase
- rimozione accenti e caratteri speciali
- spazi → trattini
- es. "A(I)gents per la funzione Finance" → `ai-gents-per-la-funzione-finance`

Lo slug viene aggiunto al campo di ogni articolo in `articles.json`.

### Articoli bilingui

Le coppie IT/EN con contenuto equivalente vivono su **un'unica URL**. La pagina espone entrambe le versioni con un toggle lingua discreto. I tag `hreflang` dichiarano a Google le due varianti linguistiche puntando alla stessa URL:

```html
<link rel="alternate" hreflang="it" href="https://writing.rbovetti.com/articles/[slug]" />
<link rel="alternate" hreflang="en" href="https://writing.rbovetti.com/articles/[slug]" />
<link rel="alternate" hreflang="x-default" href="https://writing.rbovetti.com/articles/[slug]" />
```

Il campo `linkedArticleId` in `articles.json` collega la versione IT alla EN corrispondente.

---

## Da SPA a Static Site Generation (SSG)

Adozione di `vite-plugin-ssg` per pre-renderizzare ogni URL come file HTML statico al momento del build. Vercel serve HTML puro — Google indicizza il contenuto senza eseguire JavaScript.

Le Vercel Functions esistenti (email SMTP, Google Sheets) rimangono invariate: operano lato server e non sono interessate dalla migrazione SSG.

---

## Contenuto di ogni pagina articolo

```
┌─────────────────────────────────────────┐
│  [TOPIC]  •  [DATA]                     │
│                                         │
│  Titolo completo articolo               │
│                                         │
│  Abstract / intro (150-300 parole HTML) │
│  Testo leggibile con keyword naturali   │
│                                         │
│  ─────────────────────────────          │
│  [ Sfoglia carosello ] [ Download PDF ] │
└─────────────────────────────────────────┘
```

L'abstract è il testo già esistente degli articoli, adattato in HTML. Non richiede riscrittura, solo formattazione. Per gli articoli bilingui, entrambe le versioni dell'abstract sono presenti nella stessa pagina (mostrate/nascoste via toggle lingua).

---

## Pagina /about

Nuova pagina con:
- Presentazione professionale (chi è Riccardo Bovetti, aree di ricerca: AI governance, Finance, Philosophy of Technology)
- Lista completa dei paper con link alle rispettive pagine articolo
- Link al profilo LinkedIn
- Schema JSON-LD `Person` (vedi sotto)

Ottimizzata per ricerche nominative: "Riccardo Bovetti AI", "Riccardo Bovetti paper AI governance".

---

## SEO tecnico

### Meta tag dinamici

Ogni pagina articolo genera i propri tag a partire dai dati in `articles.json`:

```html
<title>[Titolo articolo] — Riccardo Bovetti</title>
<meta name="description" content="[abstract troncato a 155 caratteri]" />
<meta name="author" content="Riccardo Bovetti" />

<!-- Open Graph (LinkedIn, social) -->
<meta property="og:type" content="article" />
<meta property="og:title" content="[Titolo articolo]" />
<meta property="og:description" content="[abstract troncato]" />
<meta property="og:url" content="https://writing.rbovetti.com/articles/[slug]" />
<meta property="og:image" content="https://writing.rbovetti.com/covers/[slug].jpg" />

<!-- Canonical -->
<link rel="canonical" href="https://writing.rbovetti.com/articles/[slug]" />
```

Implementazione tramite `react-helmet-async` (compatibile con SSG).

### Sitemap XML

`/sitemap.xml` generato automaticamente ad ogni build da `vite-plugin-ssg`, elenca:
- `/`
- `/about`
- `/articles/[slug]` per ogni articolo

### robots.txt

```
User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://writing.rbovetti.com/sitemap.xml
```

### Structured Data (JSON-LD)

**Su ogni pagina articolo:**
```json
{
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "headline": "[titolo]",
  "description": "[abstract]",
  "author": {
    "@type": "Person",
    "name": "Riccardo Bovetti",
    "url": "https://writing.rbovetti.com/about"
  },
  "inLanguage": "[it|en]",
  "url": "https://writing.rbovetti.com/articles/[slug]"
}
```

**Su /about:**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Riccardo Bovetti",
  "url": "https://writing.rbovetti.com",
  "sameAs": ["https://www.linkedin.com/in/[handle]"],
  "knowsAbout": ["Artificial Intelligence", "AI Governance", "Finance Technology", "Philosophy of Technology"]
}
```

---

## Misurazione

Da attivare al giorno 1, prima di qualsiasi altra modifica:

- **Google Search Console**: verifica proprietà del dominio, submit sitemap, monitoraggio indicizzazione e keyword con impressioni
- **Google Analytics 4**: tracciamento traffico organico vs LinkedIn vs direct, eventi download PDF, eventi form lead generation

---

## Presenza accademica (off-site, ongoing)

Da costruire in parallelo all'implementazione tecnica:

| Piattaforma | Azione | Beneficio |
|-------------|--------|-----------|
| **Google Scholar** | Creare profilo autore, collegare paper | Appare nelle ricerche accademiche, aggregatore citazioni |
| **SSRN / ResearchGate** | Caricare PDF con abstract e link al sito | Backlink accademici, visibilità in community Finance/AI |
| **Zenodo** | Depositare paper con DOI | Paper formalmente citabile, backlink open access |
| **LinkedIn** | Ogni post futuro punta alla pagina articolo specifica; riattivare post passati con commento + link | Backlink di qualità, traffico referral diretto |

---

## Sprint di implementazione

| Sprint | Contenuto | Durata stimata |
|--------|-----------|----------------|
| **1** | SSG migration (`vite-plugin-ssg`) + route `/articles/[slug]` + slug in `articles.json` | 1-2 settimane |
| **2** | Meta tag dinamici (`react-helmet-async`) + OG per articolo + `sitemap.xml` + `robots.txt` + `hreflang` per coppie bilingui | 1 settimana |
| **3** | Abstract HTML su ogni pagina articolo + pagina `/about` con lista paper | 1-2 settimane |
| **4** | JSON-LD `ScholarlyArticle` + `Person` + attivazione Google Search Console + GA4 | 1 settimana |
| **5 (ongoing)** | Google Scholar + SSRN/Zenodo + aggiornamento strategia LinkedIn | continuativo |

---

## Criteri di successo (a 3 mesi)

- Almeno 15 delle 19 pagine articolo indicizzate in Google Search Console
- Impressioni organiche su keyword tematiche (AI agents, AI governance finance, ecc.)
- Traffico referral da LinkedIn tracciabile per singola pagina articolo
- Profilo Google Scholar attivo con paper collegati
