import {
  generateId,
  formatDate,
  mergeObjects,
  getContrastColor,
  debounce,
  throttle,
  deepClone,
} from '../helpers'

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

    it('should return empty string for undefined date', () => {
      expect(formatDate(undefined)).toBe('')
    })
  })

  describe('getContrastColor', () => {
    it('should return black for light colors', () => {
      expect(getContrastColor('#FFFFFF')).toBe('#000000')
      expect(getContrastColor('#FFFF00')).toBe('#000000') // Yellow is light
    })

    it('should return white for dark colors', () => {
      expect(getContrastColor('#000000')).toBe('#ffffff')
      expect(getContrastColor('#000080')).toBe('#ffffff')
      expect(getContrastColor('#FF0000')).toBe('#ffffff') // Red is dark
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })
    afterEach(() => {
      jest.useRealTimers()
    })
    it('should debounce function calls', () => {
      const func = jest.fn()
      const debounced = debounce(func, 100)
      debounced()
      debounced()
      debounced()
      expect(func).not.toHaveBeenCalled()
      jest.advanceTimersByTime(100)
      expect(func).toHaveBeenCalledTimes(1)
    })
  })

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })
    afterEach(() => {
      jest.useRealTimers()
    })
    it('should throttle function calls', () => {
      const func = jest.fn()
      const throttled = throttle(func, 100)
      throttled()
      throttled()
      throttled()
      expect(func).toHaveBeenCalledTimes(1)
      jest.advanceTimersByTime(100)
      throttled()
      expect(func).toHaveBeenCalledTimes(2)
    })
  })

  describe('deepClone', () => {
    it('should create a deep copy of an object', () => {
      const original = { a: 1, b: { c: 2 } }
      const cloned = deepClone(original)
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      cloned.b.c = 3
      expect(original.b.c).toBe(2)
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

    it('should handle null/undefined inputs', () => {
      expect(mergeObjects(null, { a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
      expect(mergeObjects({ a: 1 }, null, { b: 2 })).toEqual({ b: 2 })
      expect(mergeObjects({ a: 1 }, { b: 2 }, null)).toEqual({ a: 1, b: 2 })
    })

    it('should merge nested objects', () => {
      const base = { a: { x: 1, y: 2 } }
      const local = { a: { x: 1, y: 3 } }
      const server = { a: { x: 2, y: 2 } }
      const merged = mergeObjects(base, local, server)
      expect(merged.a.y).toBe(3)
      expect(merged.a.x).toBe(2)
    })

    it('should handle array conflicts', () => {
      const base = { tags: ['a', 'b'] }
      const local = { tags: ['a', 'b', 'c'] }
      const server = { tags: ['a', 'b'] }
      const merged = mergeObjects(base, local, server)
      expect(merged.tags).toEqual(['a', 'b', 'c'])
    })

    it('should use local value when different from both base and server', () => {
      const base = { title: 'Base' }
      const local = { title: 'Local' }
      const server = { title: 'Server' }
      const merged = mergeObjects(base, local, server)
      expect(merged.title).toBe('Local')
    })
  })
})

