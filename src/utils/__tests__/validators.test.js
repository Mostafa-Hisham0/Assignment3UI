import { validateCard, validateList, validateTag } from '../validators'

describe('validators', () => {
  describe('validateCard', () => {
    it('should validate a valid card', () => {
      const card = { title: 'Test Card', description: 'Test', tags: [] }
      const result = validateCard(card)
      expect(result.valid).toBe(true)
    })

    it('should reject card without title', () => {
      const card = { description: 'Test' }
      const result = validateCard(card)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('title')
    })

    it('should reject card with title too long', () => {
      const card = { title: 'a'.repeat(201) }
      const result = validateCard(card)
      expect(result.valid).toBe(false)
    })
  })

  describe('validateList', () => {
    it('should validate a valid list', () => {
      const list = { title: 'Test List' }
      const result = validateList(list)
      expect(result.valid).toBe(true)
    })

    it('should reject list without title', () => {
      const list = {}
      const result = validateList(list)
      expect(result.valid).toBe(false)
    })
  })

  describe('validateTag', () => {
    it('should validate a valid tag', () => {
      const result = validateTag('test')
      expect(result.valid).toBe(true)
    })

    it('should reject empty tag', () => {
      const result = validateTag('')
      expect(result.valid).toBe(false)
    })

    it('should reject tag that is too long', () => {
      const result = validateTag('a'.repeat(31))
      expect(result.valid).toBe(false)
    })
  })
})

