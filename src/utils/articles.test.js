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
  it("restituisce l'articolo italiano come primario quando entrambe le lingue sono presenti", () => {
    const pair = findBySlug(mockArticles, 'aigents-funzione-finance')
    expect(getPrimary(pair).language).toBe('it')
  })

  it("restituisce l'unico articolo per uno standalone", () => {
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
