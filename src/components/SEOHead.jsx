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
