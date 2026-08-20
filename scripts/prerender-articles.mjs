import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = resolve(fileURLToPath(new URL('.', import.meta.url)))
const projectRoot = resolve(scriptDir, '..')

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function stripHtml(value = '') {
  return String(value).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function articleMarkup(primary, articles) {
  const bilingual = articles.length === 2
  const abstract = primary.abstract || `<p>${escapeHtml(primary.description || '')}</p>`
  const languageButtons = bilingual
    ? `<div class="flex gap-2"><button type="button">Italiano</button><button type="button">English</button></div>`
    : ''

  return `<div class="min-h-screen flex flex-col bg-bg-primary">
  <header class="fixed top-0 left-0 right-0 bg-bg border-b border-accent-cold/10 py-8 z-40">
    <div class="container mx-auto px-5 max-w-6xl"><a href="/" class="text-text-primary font-serif text-3xl">All you need is thought</a></div>
  </header>
  <main class="flex-grow max-w-3xl mx-auto w-full px-6 pt-52 pb-16">
    <a href="/" class="text-accent-warm text-sm mb-8 inline-block">← Tutti gli articoli</a>
    <div class="flex items-center gap-3 mt-4 mb-6 flex-wrap">
      <span class="inline-block px-3 py-1 rounded-full text-sm font-medium bg-accent-warm/10 text-accent-warm border border-accent-warm">${escapeHtml(primary.topic)}</span>
      ${languageButtons}
    </div>
    <h1 class="text-3xl font-serif font-medium text-text-primary mb-8 leading-tight">${escapeHtml(primary.title)}</h1>
    <div class="text-text-secondary leading-relaxed mb-10 text-lg">${abstract}</div>
  </main>
  <footer class="bg-bg border-t border-accent-cold/10 py-8 mt-12 text-center"><a href="https://rbovetti.com/ai-transparency/" target="_blank" rel="noreferrer">AI Transparency</a></footer>
</div>`
}

export function buildArticleDocument(template, primary, articles) {
  const description = stripHtml(primary.abstract || primary.description || '').slice(0, 155)
  const title = `${escapeHtml(primary.title)} — Riccardo Bovetti`
  const body = articleMarkup(primary, articles)

  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${primary.language || 'it'}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
}

export async function prerenderArticles({ root = projectRoot } = {}) {
  const articlesData = JSON.parse(await readFile(resolve(root, 'public/articles.json'), 'utf8'))
  const template = await readFile(resolve(root, 'dist/index.html'), 'utf8')
  const grouped = new Map()

  for (const article of articlesData.articles) {
    const group = grouped.get(article.slug) || []
    group.push(article)
    grouped.set(article.slug, group)
  }

  for (const [slug, articles] of grouped) {
    const primary = articles.find((article) => article.language === 'it') || articles[0]
    const outputDir = resolve(root, 'dist/articles', slug)
    await mkdir(outputDir, { recursive: true })
    await writeFile(resolve(outputDir, 'index.html'), buildArticleDocument(template, primary, articles))
  }

  return grouped.size
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const count = await prerenderArticles()
  console.log(`Pre-rendered ${count} article routes`)
}
