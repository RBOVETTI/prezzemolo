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
        <main className="flex-grow max-w-3xl mx-auto w-full px-6 pt-52 pb-16">

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
