import { generateId, formatDate, mergeObjects } from '../helpers'

describe('helpers', () => {
  describe('generateId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
    })
  })

  describe('formatDate', () => {
    it('should format a date', () => {
      const date = new Date('2024-01-01')
      const formatted = formatDate(date.toISOString())
      expect(formatted).toBeTruthy()
    })

    it('should return empty string for null date', () => {
      expect(formatDate(null)).toBe('')
    })
  })

  describe('mergeObjects', () => {
    it('should merge objects correctly', () => {
      const base = { a: 1, b: 2 }
      const local = { a: 1, b: 3 }
      const server = { a: 2, b: 2 }
      const merged = mergeObjects(base, local, server)
      expect(merged.b).toBe(3)
      expect(merged.a).toBe(2)
    })
  })
})

