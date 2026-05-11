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
