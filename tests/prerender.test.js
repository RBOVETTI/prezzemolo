import { describe, expect, it } from 'vitest'
import { buildArticleDocument } from '../scripts/prerender-articles.mjs'

describe('pre-rendered article routes', () => {
  it('writes a static HTML entry point for every article deep link', () => {
    const document = buildArticleDocument(
      '<html lang="it"><head><title>Home</title><meta name="description" content="Home" /></head><body><div id="root"></div></body></html>',
      {
        title: 'A(I)gents for Finance',
        description: 'A description',
        topic: 'AI',
        language: 'it',
      },
      [],
    )

    expect(document).toContain('A(I)gents for Finance')
    expect(document).toContain('<div id="root"><div class="min-h-screen')
  })
})
