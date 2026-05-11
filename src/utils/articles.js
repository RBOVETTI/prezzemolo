export function findBySlug(articles, slug) {
  return articles.filter(a => a.slug === slug)
}

export function getPrimary(articles) {
  return articles.find(a => a.language === 'it') ?? articles[0]
}

export function isPair(articles) {
  return articles.length === 2
}
