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
