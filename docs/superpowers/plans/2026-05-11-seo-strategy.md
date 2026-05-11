# SEO Strategy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trasformare writing.rbovetti.com da SPA con un solo URL indicizzabile in un sito con 19 pagine articolo individuali, meta tag per pagina, sitemap.xml, robots.txt e schema.org structured data per visibilità come thought leader accademico.

**Architecture:** Mantiene la React SPA con BrowserRouter; aggiunge route `/articles/:slug` e `/about`, `react-helmet-async` per meta tag dinamici, sitemap generata da script Node.js. La migrazione SSG è rinviata (rischio di compatibilità react-router-dom v7 + React 19) — Googlebot renderizza JS in modo affidabile per siti piccoli. Le Vercel Functions esistenti restano invariate.

**Tech Stack:** React 19, React Router DOM v7, Vite 7, Tailwind CSS, react-helmet-async (nuovo), Vitest (nuovo, solo per utility pure)

---

## File Map

**Creati:**
- `src/utils/slugify.js` — funzione pura di generazione slug
- `src/utils/slugify.test.js` — test Vitest
- `src/utils/articles.js` — helper puri: findBySlug, getPrimary, isPair
- `src/utils/articles.test.js` — test Vitest
- `src/utils/seo.js` — builder oggetti JSON-LD (ScholarlyArticle)
- `src/components/SEOHead.jsx` — wrapper react-helmet-async con meta tag per pagina
- `src/pages/ArticlePage.jsx` — pagina per-articolo con abstract + opzioni + JSON-LD
- `src/pages/AboutPage.jsx` — profilo autore con JSON-LD Person e lista paper
- `scripts/generate-sitemap.js` — script Node.js → public/sitemap.xml
- `public/robots.txt`
- `public/sitemap.xml` (generato dallo script)

**Modificati:**
- `public/articles.json` — aggiunge slug, linkedArticleId, abstract
- `src/App.jsx` — aggiunge HelmetProvider, route /articles/:slug e /about
- `src/components/ArticleCard.jsx` — aggiunge Link a /articles/:slug sul titolo
- `src/components/Header.jsx` — aggiunge link /about
- `src/pages/HomePage.jsx` — aggiunge SEOHead
- `src/pages/PrivacyPolicy.jsx` — aggiunge SEOHead
- `package.json` — aggiunge react-helmet-async, vitest; script generate-sitemap; override build
- `vite.config.js` — aggiunge configurazione Vitest
- `index.html` — aggiunge Google Search Console verification tag + GA4 (Task 14)

---

## Task 1: Aggiorna articles.json con slug, linkedArticleId e abstract

**Files:**
- Modify: `public/articles.json`

Gli articoli bilingui (stesso contenuto in IT e EN) condividono lo stesso slug e un'unica URL.
Le coppie individuate sono:

| ID IT | ID EN | Slug condiviso |
|-------|-------|----------------|
| 2     | 1     | `aigents-funzione-finance` |
| 3     | 13    | `illusione-ai-agentica` |
| 8     | 15    | `genai-archetipo-scomposizione` |
| 9     | 12    | `paradosso-ai-literacy` |
| 11    | 14    | `impatto-genai-didattica` |
| 16    | 17    | `ai-pensa-per-noi` |

Articoli standalone (solo IT):

| ID | Slug |
|----|------|
| 4  | `venere-marte-stessa-galassia` |
| 5  | `dal-niente-allagente` |
| 6  | `concrethica` |
| 7  | `distant-reading-llm` |
| 10 | `framework-integrazione-ai` |
| 18 | `complessita-sistemi-di-senso` |
| 19 | `la-costituzione-dellai` |

- [ ] **Step 1: Aggiungi i tre nuovi campi a ogni articolo in articles.json**

Per ogni oggetto articolo aggiungi:
```json
"slug": "<slug dalla tabella sopra>",
"linkedArticleId": <id dell'articolo gemello, oppure null>,
"abstract": ""
```

Tabella completa dei valori per ogni articolo:

| id | slug | linkedArticleId |
|----|------|-----------------|
| 1  | `aigents-funzione-finance` | 2 |
| 2  | `aigents-funzione-finance` | 1 |
| 3  | `illusione-ai-agentica` | 13 |
| 4  | `venere-marte-stessa-galassia` | null |
| 5  | `dal-niente-allagente` | null |
| 6  | `concrethica` | null |
| 7  | `distant-reading-llm` | null |
| 8  | `genai-archetipo-scomposizione` | 15 |
| 9  | `paradosso-ai-literacy` | 12 |
| 10 | `framework-integrazione-ai` | null |
| 11 | `impatto-genai-didattica` | 14 |
| 12 | `paradosso-ai-literacy` | 9 |
| 13 | `illusione-ai-agentica` | 3 |
| 14 | `impatto-genai-didattica` | 11 |
| 15 | `genai-archetipo-scomposizione` | 8 |
| 16 | `ai-pensa-per-noi` | 17 |
| 17 | `ai-pensa-per-noi` | 16 |
| 18 | `complessita-sistemi-di-senso` | null |
| 19 | `la-costituzione-dellai` | null |

Esempio di come appare l'articolo 1 dopo l'aggiornamento:
```json
{
  "id": 1,
  "title": "A(I)gents for Finance: ...",
  "description": "AI agents will not transform Finance...",
  "topic": "A(I)GENTS",
  "language": "en",
  "protected": false,
  "slug": "aigents-funzione-finance",
  "linkedArticleId": 2,
  "abstract": "",
  "options": [...]
}
```

- [ ] **Step 2: Verifica che il JSON sia valido**

```bash
node -e "JSON.parse(require('fs').readFileSync('public/articles.json','utf8')); console.log('OK')"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add public/articles.json
git commit -m "feat: aggiunge slug, linkedArticleId, abstract ad articles.json"
```

---

## Task 2: Installa dipendenze e configura Vitest

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Installa react-helmet-async e vitest**

```bash
npm install react-helmet-async
npm install --save-dev vitest
```

- [ ] **Step 2: Aggiungi config Vitest a vite.config.js**

Sostituisci il contenuto di `vite.config.js` con:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
  },
})
```

- [ ] **Step 3: Aggiungi script test a package.json**

Nel blocco `"scripts"` di `package.json`, aggiungi:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verifica che vitest parta**

```bash
npm run test
```
Expected: nessun errore (0 test trovati o simile).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.js
git commit -m "chore: aggiunge react-helmet-async e vitest"
```

---

## Task 3: Crea utility slugify con test

**Files:**
- Create: `src/utils/slugify.js`
- Create: `src/utils/slugify.test.js`

- [ ] **Step 1: Scrivi i test prima dell'implementazione**

Crea `src/utils/slugify.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('converte in lowercase e sostituisce spazi con trattini', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('rimuove le parentesi', () => {
    expect(slugify('A(I)gents')).toBe('aigents')
  })

  it('rimuove gli accenti', () => {
    expect(slugify('Complessità')).toBe('complessita')
  })

  it('rimuove virgolette e apostrofi', () => {
    expect(slugify("L'illusione dell'\"AI\"")).toBe('lillusione-dellai')
  })

  it('collassa trattini multipli', () => {
    expect(slugify('hello -- world')).toBe('hello-world')
  })

  it('rimuove trattini iniziali e finali', () => {
    expect(slugify('  hello world  ')).toBe('hello-world')
  })
})
```

- [ ] **Step 2: Esegui i test e verifica che falliscano**

```bash
npm run test
```
Expected: FAIL — `Cannot find module './slugify'`

- [ ] **Step 3: Implementa slugify**

Crea `src/utils/slugify.js`:
```js
export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[()'"«»""'']/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

```bash
npm run test
```
Expected: 6 test passati.

- [ ] **Step 5: Commit**

```bash
git add src/utils/slugify.js src/utils/slugify.test.js
git commit -m "feat: aggiunge utility slugify con test"
```

---

## Task 4: Crea utility articles con test

**Files:**
- Create: `src/utils/articles.js`
- Create: `src/utils/articles.test.js`

- [ ] **Step 1: Scrivi i test**

Crea `src/utils/articles.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { findBySlug, getPrimary, isPair } from './articles'

const mockArticles = [
  { id: 1, slug: 'aigents-funzione-finance', language: 'en', linkedArticleId: 2, title: 'EN Title', abstract: '', description: 'desc' },
  { id: 2, slug: 'aigents-funzione-finance', language: 'it', linkedArticleId: 1, title: 'IT Title', abstract: '', description: 'desc' },
  { id: 4, slug: 'venere-marte', language: 'it', linkedArticleId: null, title: 'Solo IT', abstract: '', description: 'desc' },
]

describe('findBySlug', () => {
  it('restituisce entrambi gli articoli per una coppia bilingue', () => {
    expect(findBySlug(mockArticles, 'aigents-funzione-finance')).toHaveLength(2)
  })

  it('restituisce un articolo per uno standalone', () => {
    expect(findBySlug(mockArticles, 'venere-marte')).toHaveLength(1)
  })

  it('restituisce array vuoto per slug sconosciuto', () => {
    expect(findBySlug(mockArticles, 'non-esiste')).toHaveLength(0)
  })
})

describe('getPrimary', () => {
  it('restituisce l\'articolo italiano come primario quando entrambe le lingue sono presenti', () => {
    const pair = findBySlug(mockArticles, 'aigents-funzione-finance')
    expect(getPrimary(pair).language).toBe('it')
  })

  it('restituisce l\'unico articolo per uno standalone', () => {
    const standalone = findBySlug(mockArticles, 'venere-marte')
    expect(getPrimary(standalone).id).toBe(4)
  })
})

describe('isPair', () => {
  it('restituisce true per una coppia bilingue', () => {
    expect(isPair(findBySlug(mockArticles, 'aigents-funzione-finance'))).toBe(true)
  })

  it('restituisce false per uno standalone', () => {
    expect(isPair(findBySlug(mockArticles, 'venere-marte'))).toBe(false)
  })
})
```

- [ ] **Step 2: Esegui i test e verifica che falliscano**

```bash
npm run test
```
Expected: FAIL — `Cannot find module './articles'`

- [ ] **Step 3: Implementa articles utility**

Crea `src/utils/articles.js`:
```js
export function findBySlug(articles, slug) {
  return articles.filter(a => a.slug === slug)
}

export function getPrimary(articles) {
  return articles.find(a => a.language === 'it') ?? articles[0]
}

export function isPair(articles) {
  return articles.length === 2
}
```

- [ ] **Step 4: Esegui i test e verifica che passino**

```bash
npm run test
```
Expected: 7 test passati.

- [ ] **Step 5: Commit**

```bash
git add src/utils/articles.js src/utils/articles.test.js
git commit -m "feat: aggiunge utility articles con test"
```

---

## Task 5: Crea SEOHead e aggiorna App.jsx con HelmetProvider e nuove route

**Files:**
- Create: `src/components/SEOHead.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Crea SEOHead**

Crea `src/components/SEOHead.jsx`:
```jsx
import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://writing.rbovetti.com'
const DEFAULT_IMAGE = `${SITE_URL}/Image_og.jpg`
const SITE_NAME = 'All you need is thought'

export default function SEOHead({
  title,
  description,
  url,
  image = DEFAULT_IMAGE,
  language = 'it',
  type = 'website',
  hreflangSameUrl = false,
}) {
  const fullTitle = title
    ? `${title} — Riccardo Bovetti`
    : 'All you need is thought — Riccardo Bovetti'
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL
  const truncatedDescription = description?.slice(0, 155) ?? ''

  return (
    <Helmet>
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={truncatedDescription} />
      <meta name="author" content="Riccardo Bovetti" />
      <link rel="canonical" href={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={language === 'it' ? 'it_IT' : 'en_US'} />
      {hreflangSameUrl && (
        <>
          <link rel="alternate" hrefLang="it" href={fullUrl} />
          <link rel="alternate" hrefLang="en" href={fullUrl} />
          <link rel="alternate" hrefLang="x-default" href={fullUrl} />
        </>
      )}
    </Helmet>
  )
}
```

- [ ] **Step 2: Aggiorna App.jsx con HelmetProvider e nuove route**

Sostituisci il contenuto di `src/App.jsx` con:
```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import HomePage from './pages/HomePage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import AdminPage from './pages/AdminPage'
import ArticlePage from './pages/ArticlePage'
import AboutPage from './pages/AboutPage'

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App
```

- [ ] **Step 3: Verifica che l'app parta senza errori**

```bash
npm run dev
```
Expected: dev server avvia senza errori. Nota: `/articles/:slug` e `/about` danno errore 404 finché non si creano le pagine nei task successivi — è normale.

- [ ] **Step 4: Commit**

```bash
git add src/components/SEOHead.jsx src/App.jsx
git commit -m "feat: aggiunge SEOHead, HelmetProvider e nuove route"
```

---

## Task 6: Crea ArticlePage

**Files:**
- Create: `src/pages/ArticlePage.jsx`

- [ ] **Step 1: Crea ArticlePage**

Crea `src/pages/ArticlePage.jsx`:
```jsx
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { findBySlug, getPrimary, isPair } from '../utils/articles'
import SEOHead from '../components/SEOHead'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Modal from '../components/Modal'
import PDFCarousel from '../components/PDFCarousel'
import LeadGenModal from '../components/LeadGenModal'

export default function ArticlePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [allArticles, setAllArticles] = useState([])
  const [articles, setArticles] = useState([])
  const [activeLanguage, setActiveLanguage] = useState(null)
  const [carouselModal, setCarouselModal] = useState({ isOpen: false, title: '', file: '' })
  const [leadGenModal, setLeadGenModal] = useState({ isOpen: false, article: null })

  useEffect(() => {
    fetch('/articles.json')
      .then(res => res.json())
      .then(data => setAllArticles(data.articles))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!allArticles.length) return
    const found = findBySlug(allArticles, slug)
    if (!found.length) {
      navigate('/', { replace: true })
      return
    }
    setArticles(found)
    setActiveLanguage(getPrimary(found).language)
  }, [allArticles, slug, navigate])

  if (!articles.length) return null

  const primary = getPrimary(articles)
  const bilingual = isPair(articles)
  const active = articles.find(a => a.language === activeLanguage) ?? primary

  const handleOptionClick = (option, article) => {
    if (option.type === 'download') {
      window.open(option.file, '_blank')
    } else if (option.type === 'carousel') {
      setCarouselModal({ isOpen: true, title: article.title, file: option.file })
    } else if (option.type === 'protected-download') {
      setLeadGenModal({ isOpen: true, article })
    }
  }

  return (
    <>
      <SEOHead
        title={primary.title}
        description={primary.abstract || primary.description}
        url={`/articles/${slug}`}
        language={primary.language}
        type="article"
        hreflangSameUrl={bilingual}
      />

      <div className="min-h-screen flex flex-col bg-bg-primary">
        <Header />
        <main className="flex-grow max-w-3xl mx-auto w-full px-6 pt-32 md:pt-36 pb-16">

          <Link to="/" className="text-accent-warm text-sm hover:underline mb-8 inline-block">
            ← Tutti gli articoli
          </Link>

          <div className="flex items-center gap-3 mt-4 mb-6 flex-wrap">
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-accent-warm/10 text-accent-warm border border-accent-warm">
              {primary.topic}
            </span>
            {bilingual && (
              <div className="flex gap-2">
                {articles.map(a => (
                  <button
                    key={a.language}
                    onClick={() => setActiveLanguage(a.language)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${
                      activeLanguage === a.language
                        ? 'bg-accent-cold text-white border-accent-cold'
                        : 'bg-transparent text-accent-cold border-accent-cold/50 hover:border-accent-cold'
                    }`}
                  >
                    {a.language === 'it' ? 'Italiano' : 'English'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <h1 className="text-3xl font-serif font-medium text-text-primary mb-8 leading-tight">
            {active.title}
          </h1>

          <div className="text-text-secondary leading-relaxed mb-10 text-lg">
            {active.abstract ? (
              <div dangerouslySetInnerHTML={{ __html: active.abstract }} />
            ) : (
              <p>{active.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {active.options?.map((option, i) => (
              <button
                key={i}
                onClick={() => handleOptionClick(option, active)}
                className={`px-6 py-3 rounded font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  option.type === 'carousel'
                    ? 'bg-transparent border border-accent-cold text-accent-cold hover:bg-accent-cold hover:text-white'
                    : 'bg-accent-warm hover:bg-accent-warm/90 text-white'
                }`}
              >
                {option.type === 'protected-download' ? '🔒 ' : ''}{option.label}
              </button>
            ))}
          </div>
        </main>
        <Footer />
      </div>

      <Modal
        isOpen={carouselModal.isOpen}
        onClose={() => setCarouselModal({ isOpen: false, title: '', file: '' })}
        title={carouselModal.title}
      >
        <PDFCarousel file={carouselModal.file} />
      </Modal>

      {leadGenModal.isOpen && (
        <LeadGenModal
          article={leadGenModal.article}
          onClose={() => setLeadGenModal({ isOpen: false, article: null })}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Testa manualmente**

```bash
npm run dev
```

Apri http://localhost:5173/articles/aigents-funzione-finance — deve mostrare la pagina articolo con titolo, descrizione, toggle IT/EN e pulsanti download/carosello.

Apri http://localhost:5173/articles/venere-marte-stessa-galassia — deve mostrare la pagina senza toggle lingua.

Apri http://localhost:5173/articles/non-esiste — deve reindirizzare alla homepage.

- [ ] **Step 3: Commit**

```bash
git add src/pages/ArticlePage.jsx
git commit -m "feat: aggiunge ArticlePage con toggle bilingue e opzioni"
```

---

## Task 7: Aggiungi link dalle card articolo alle pagine /articles/:slug

**Files:**
- Modify: `src/components/ArticleCard.jsx`

- [ ] **Step 1: Aggiungi import Link**

In `src/components/ArticleCard.jsx`, aggiungi in cima al file:
```jsx
import { Link } from 'react-router-dom'
```

- [ ] **Step 2: Avvolgi il titolo con Link**

Trova il tag `<h2>` contenente `{article.title}` e sostituiscilo con:
```jsx
<Link
  to={`/articles/${article.slug}`}
  className="hover:text-accent-warm transition-colors"
>
  <h2 className="text-xl font-serif font-medium text-text-primary mb-3">
    {article.title}
  </h2>
</Link>
```

- [ ] **Step 3: Verifica**

```bash
npm run dev
```
Apri http://localhost:5173 — clicca sul titolo di un articolo → deve navigare a `/articles/[slug]`.

- [ ] **Step 4: Commit**

```bash
git add src/components/ArticleCard.jsx
git commit -m "feat: link titoli articoli a /articles/:slug"
```

---

## Task 8: Aggiungi meta tag a HomePage e PrivacyPolicy, link /about in Header

**Files:**
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/pages/PrivacyPolicy.jsx`
- Modify: `src/components/Header.jsx`

- [ ] **Step 1: Aggiungi SEOHead a HomePage**

In `src/pages/HomePage.jsx`, aggiungi l'import:
```jsx
import SEOHead from '../components/SEOHead'
```

All'interno del `return (...)`, aggiungi `<SEOHead />` come primo elemento (prima di `<Header />`):
```jsx
return (
  <>
    <SEOHead
      description="Raccolta di paper e riflessioni su intelligenza artificiale, etica, filosofia e pensiero critico. Di Riccardo Bovetti."
      url="/"
    />
    <Header />
    ...
  </>
)
```

- [ ] **Step 2: Aggiungi SEOHead a PrivacyPolicy**

In `src/pages/PrivacyPolicy.jsx`, aggiungi l'import in cima:
```jsx
import SEOHead from '../components/SEOHead'
```

All'interno del `return (...)`, aggiungi come primo elemento dentro il Fragment o div esterno:
```jsx
<SEOHead
  title="Privacy Policy"
  description="Informativa sulla privacy e cookie policy del sito writing.rbovetti.com di Riccardo Bovetti."
  url="/privacy-policy"
/>
```

- [ ] **Step 3: Aggiungi link /about in Header**

In `src/components/Header.jsx`, aggiungi l'import `Link`:
```jsx
import { Link } from 'react-router-dom'
```

Nel blocco `<div className="flex items-center gap-3 ml-4 flex-shrink-0">`, aggiungi un link alla pagina About prima del bottone admin:
```jsx
<Link
  to="/about"
  title="About"
  className="text-text-secondary hover:text-accent-warm transition-colors text-sm font-serif"
>
  About
</Link>
```

- [ ] **Step 4: Verifica**

```bash
npm run dev
```
- http://localhost:5173 → titolo browser: `All you need is thought — Riccardo Bovetti`
- http://localhost:5173/privacy-policy → titolo browser: `Privacy Policy — Riccardo Bovetti`
- Header mostra link "About" che porta a /about

- [ ] **Step 5: Commit**

```bash
git add src/pages/HomePage.jsx src/pages/PrivacyPolicy.jsx src/components/Header.jsx
git commit -m "feat: aggiunge meta tag SEO a HomePage e PrivacyPolicy, link About in Header"
```

---

## Task 9: Crea robots.txt e script generate-sitemap

**Files:**
- Create: `public/robots.txt`
- Create: `scripts/generate-sitemap.js`
- Create: `public/sitemap.xml` (generato)
- Modify: `package.json`

- [ ] **Step 1: Crea robots.txt**

Crea `public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://writing.rbovetti.com/sitemap.xml
```

- [ ] **Step 2: Crea la directory scripts**

```bash
mkdir -p scripts
```

- [ ] **Step 3: Crea lo script generate-sitemap.js**

Crea `scripts/generate-sitemap.js`:
```js
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const { articles } = JSON.parse(
  readFileSync(join(root, 'public/articles.json'), 'utf8')
)

const BASE_URL = 'https://writing.rbovetti.com'
const today = new Date().toISOString().split('T')[0]

// Deduplication: le coppie bilingui condividono un solo URL
const seenSlugs = new Set()
const articleSlugs = []
for (const article of articles) {
  if (!seenSlugs.has(article.slug)) {
    seenSlugs.add(article.slug)
    articleSlugs.push(article.slug)
  }
}

const staticPaths = [
  { path: '', priority: '1.0' },
  { path: '/about', priority: '0.7' },
  { path: '/privacy-policy', priority: '0.3' },
]

const allUrls = [
  ...staticPaths.map(({ path, priority }) => ({
    loc: `${BASE_URL}${path}`,
    priority,
  })),
  ...articleSlugs.map(slug => ({
    loc: `${BASE_URL}/articles/${slug}`,
    priority: '0.8',
  })),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    ({ loc, priority }) =>
      `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`
  )
  .join('\n')}
</urlset>`

writeFileSync(join(root, 'public/sitemap.xml'), xml, 'utf8')
console.log(`Sitemap generata con ${allUrls.length} URL`)
```

- [ ] **Step 4: Aggiorna package.json con gli script**

Nel blocco `"scripts"` di `package.json`:
- Sostituisci `"build": "vite build"` con `"build": "node scripts/generate-sitemap.js && vite build"`
- Aggiungi `"generate-sitemap": "node scripts/generate-sitemap.js"`

- [ ] **Step 5: Esegui lo script e verifica**

```bash
npm run generate-sitemap
```
Expected: `Sitemap generata con 16 URL`
(13 slug articoli unici + 3 pagine statiche = 16)

Apri `public/sitemap.xml` — deve contenere:
- `https://writing.rbovetti.com/`
- `https://writing.rbovetti.com/about`
- `https://writing.rbovetti.com/articles/aigents-funzione-finance`
- ... (13 URL articoli)

- [ ] **Step 6: Commit**

```bash
git add public/robots.txt public/sitemap.xml scripts/generate-sitemap.js package.json
git commit -m "feat: aggiunge robots.txt, script sitemap e override build"
```

---

## Task 10: Crea AboutPage

**Files:**
- Create: `src/pages/AboutPage.jsx`

- [ ] **Step 1: Crea AboutPage**

Crea `src/pages/AboutPage.jsx`:
```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function AboutPage() {
  const [articles, setArticles] = useState([])

  useEffect(() => {
    fetch('/articles.json')
      .then(res => res.json())
      .then(data => {
        // Per ogni slug, l'articolo IT vince su EN — evita duplicati bilingui
        const bySlug = new Map()
        for (const article of data.articles) {
          const existing = bySlug.get(article.slug)
          if (!existing || article.language === 'it') {
            bySlug.set(article.slug, article)
          }
        }
        setArticles(Array.from(bySlug.values()))
      })
      .catch(console.error)
  }, [])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Riccardo Bovetti',
    url: 'https://writing.rbovetti.com',
    sameAs: ['https://www.linkedin.com/in/rbovetti'],
    knowsAbout: [
      'Artificial Intelligence',
      'AI Governance',
      'Finance Technology',
      'Philosophy of Technology',
      'Generative AI',
    ],
  }

  return (
    <>
      <SEOHead
        title="Riccardo Bovetti — AI, Finance e Filosofia della Tecnologia"
        description="Paper e riflessioni di Riccardo Bovetti su AI governance, Finance Technology, agenti artificiali e filosofia della tecnologia."
        url="/about"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen flex flex-col bg-bg-primary">
        <Header />
        <main className="flex-grow max-w-3xl mx-auto w-full px-6 pt-32 md:pt-36 pb-16">

          <h1 className="text-4xl font-serif font-medium text-text-primary mb-6">
            Riccardo Bovetti
          </h1>

          <p className="text-text-secondary text-lg leading-relaxed mb-4">
            Scrivo di intelligenza artificiale, governance degli AI agent, Finance Technology
            e filosofia della tecnologia. Il mio lavoro cerca di colmare il divario tra
            il pensiero critico e l'innovazione tecnologica.
          </p>

          <p className="text-text-secondary leading-relaxed mb-12">
            <a
              href="https://www.linkedin.com/in/rbovetti"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-warm hover:underline"
            >
              LinkedIn →
            </a>
          </p>

          <h2 className="text-2xl font-serif font-medium text-text-primary mb-6">
            Paper e riflessioni
          </h2>

          <ul className="space-y-4">
            {articles.map(article => (
              <li key={article.id} className="border-b border-accent-cold/10 pb-4">
                <Link
                  to={`/articles/${article.slug}`}
                  className="text-text-primary hover:text-accent-warm transition-colors font-medium"
                >
                  {article.title}
                </Link>
                <span className="ml-2 text-sm text-text-secondary">[{article.topic}]</span>
              </li>
            ))}
          </ul>
        </main>
        <Footer />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verifica manualmente**

```bash
npm run dev
```
Apri http://localhost:5173/about — deve mostrare nome, bio, link LinkedIn e lista di tutti gli articoli (13 righe, senza duplicati bilingui).

- [ ] **Step 3: Commit**

```bash
git add src/pages/AboutPage.jsx
git commit -m "feat: aggiunge AboutPage con JSON-LD Person e lista paper"
```

---

## Task 11: Aggiungi JSON-LD ScholarlyArticle a ArticlePage

**Files:**
- Create: `src/utils/seo.js`
- Modify: `src/pages/ArticlePage.jsx`

- [ ] **Step 1: Crea il builder JSON-LD**

Crea `src/utils/seo.js`:
```js
const SITE_URL = 'https://writing.rbovetti.com'

export function buildScholarlyArticleJsonLd(article, slug) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: article.title,
    description: article.abstract || article.description,
    author: {
      '@type': 'Person',
      name: 'Riccardo Bovetti',
      url: `${SITE_URL}/about`,
      sameAs: ['https://www.linkedin.com/in/rbovetti'],
    },
    inLanguage: article.language === 'it' ? 'it-IT' : 'en-US',
    url: `${SITE_URL}/articles/${slug}`,
    publisher: {
      '@type': 'Person',
      name: 'Riccardo Bovetti',
    },
    about: article.topic,
  }
}
```

- [ ] **Step 2: Aggiungi JSON-LD a ArticlePage**

In `src/pages/ArticlePage.jsx`, aggiungi l'import:
```jsx
import { buildScholarlyArticleJsonLd } from '../utils/seo'
```

Nel `return (...)`, dopo `<SEOHead ... />`, aggiungi:
```jsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(buildScholarlyArticleJsonLd(primary, slug))
  }}
/>
```

- [ ] **Step 3: Verifica nel browser**

```bash
npm run dev
```
Apri http://localhost:5173/articles/aigents-funzione-finance → DevTools → Elements → cerca `application/ld+json` → deve contenere il JSON ScholarlyArticle con headline, author, url.

- [ ] **Step 4: Commit**

```bash
git add src/utils/seo.js src/pages/ArticlePage.jsx
git commit -m "feat: aggiunge JSON-LD ScholarlyArticle alle pagine articolo"
```

---

## Task 12: Compila gli abstract negli articoli (task manuale per l'autore)

**Files:**
- Modify: `public/articles.json`

Questo task è per Riccardo Bovetti — non automatizzabile.

- [ ] **Step 1: Per ogni articolo, sostituisci `"abstract": ""` con 150-300 parole di testo**

Il testo deve essere:
- Plain text o HTML semplice (es. `<p>testo</p>`, `<ul><li>...</li></ul>`)
- L'introduzione o executive summary dell'articolo originale
- 150-300 parole — sufficiente per Google e per il lettore

Inizia dagli articoli su cui vuoi posizionarti prima (AI governance, AI agents).

Per gli articoli in coppia bilingue, compila l'`abstract` sia nell'articolo IT che in quello EN (lingue diverse, stesso contenuto).

- [ ] **Step 2: Valida il JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('public/articles.json','utf8')); console.log('OK')"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add public/articles.json
git commit -m "content: aggiunge abstract agli articoli"
```

---

## Task 13: Build finale e verifica

**Files:** nessuno (solo verifica)

- [ ] **Step 1: Esegui la build completa**

```bash
npm run build
```
Expected: build completata senza errori. Lo script sitemap viene eseguito automaticamente.

- [ ] **Step 2: Avvia preview e verifica**

```bash
npm run preview
```

Verifica questi URL:
- http://localhost:4173/ — homepage funzionante
- http://localhost:4173/articles/aigents-funzione-finance — pagina articolo con toggle IT/EN
- http://localhost:4173/articles/concrethica — pagina articolo monolingue
- http://localhost:4173/about — pagina about con lista paper
- http://localhost:4173/sitemap.xml — XML ben formato con 16 URL
- http://localhost:4173/robots.txt — contenuto corretto

- [ ] **Step 3: Controlla il sorgente HTML per i meta tag**

Apri http://localhost:4173/articles/aigents-funzione-finance → View Page Source. Verifica:
- `<title>` contiene il titolo dell'articolo + "Riccardo Bovetti"
- `<meta name="description">` è presente
- `<meta property="og:title">` è presente
- `<link rel="canonical">` punta all'URL corretto
- `<script type="application/ld+json">` contiene ScholarlyArticle

- [ ] **Step 4: Esegui tutti i test**

```bash
npm run test
```
Expected: tutti i test passano.

- [ ] **Step 5: Commit eventuali fix**

```bash
git add -A
git commit -m "fix: correzioni post-build"
```

---

## Task 14: Registrazione Google Search Console e GA4 (manuale)

**Files:**
- Modify: `index.html` (aggiunge tag verifica GSC e script GA4)

- [ ] **Step 1: Crea proprietà in Google Search Console**

Vai su https://search.google.com/search-console/welcome

Seleziona "Prefisso URL" e inserisci: `https://writing.rbovetti.com`

- [ ] **Step 2: Verifica proprietà via meta tag HTML**

Google fornirà un tag del tipo:
```html
<meta name="google-site-verification" content="XXXX_IL_TUO_CODICE" />
```

Aggiungilo in `index.html` dentro `<head>`, dopo i tag esistenti. Poi:
```bash
git add index.html
git commit -m "chore: aggiunge tag verifica Google Search Console"
```

Deploya su Vercel (push su main), poi clicca "Verifica" in Search Console.

- [ ] **Step 3: Invia sitemap**

In Search Console → Sitemap → inserisci `sitemap.xml` → Invia.

- [ ] **Step 4: Configura Google Analytics 4**

Vai su https://analytics.google.com → Crea proprietà per `writing.rbovetti.com`.

Copia il Measurement ID (formato: `G-XXXXXXXXXX`).

Aggiungi a `index.html` dentro `<head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

(Sostituisci `G-XXXXXXXXXX` con il tuo Measurement ID reale.)

```bash
git add index.html
git commit -m "chore: aggiunge Google Analytics 4"
```

---

## Task 15: Deploy e verifica in produzione

- [ ] **Step 1: Push su main**

```bash
git push origin main
```
Vercel rileva il push e avvia il deploy automaticamente. Attendi il completamento.

- [ ] **Step 2: Verifica URL di produzione**

- https://writing.rbovetti.com/articles/aigents-funzione-finance — pagina articolo carica
- https://writing.rbovetti.com/about — pagina about carica
- https://writing.rbovetti.com/sitemap.xml — sitemap accessibile
- https://writing.rbovetti.com/robots.txt — robots.txt accessibile

- [ ] **Step 3: Test Rich Results di Google**

Vai su https://search.google.com/test/rich-results

Inserisci: `https://writing.rbovetti.com/articles/aigents-funzione-finance`

Expected: rileva `ScholarlyArticle` senza errori.

---

## Nota post-implementazione: presenza accademica (off-site)

Questi passi non richiedono codice e possono essere fatti in parallelo con l'implementazione.

- [ ] Crea profilo **Google Scholar**: https://scholar.google.com/citations?hl=it → "My profile" → aggiungi paper con link alle pagine `/articles/[slug]`
- [ ] Carica paper su **SSRN** (https://www.ssrn.com) o **ResearchGate** con abstract e link al sito
- [ ] Carica paper su **Zenodo** (https://zenodo.org) per ottenere un DOI citabile
- [ ] Per ogni nuovo post LinkedIn su un argomento trattato in un paper: aggiungi in chiusura il link alla pagina `/articles/[slug]` corrispondente
- [ ] Per post LinkedIn precedenti: aggiungi un commento con il link alla nuova pagina articolo
