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
