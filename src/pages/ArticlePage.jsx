import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { findBySlug, getPrimary, isPair } from '../utils/articles'
import { buildScholarlyArticleJsonLd } from '../utils/seo'
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildScholarlyArticleJsonLd(primary, slug))
        }}
      />

      <div className="min-h-screen flex flex-col bg-bg-primary">
        <Header />
        <main className="flex-grow max-w-3xl mx-auto w-full px-6 pt-52 pb-16">

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
