import * as storage from '../storage'

// Mock IndexedDB
const mockDB = {
  transaction: jest.fn(() => ({
    objectStore: jest.fn(() => ({
      put: jest.fn(() => ({ onsuccess: null, onerror: null })),
      get: jest.fn(() => ({ onsuccess: null, onerror: null })),
      getAll: jest.fn(() => ({ onsuccess: null, onerror: null, result: [] })),
      delete: jest.fn(() => ({ onsuccess: null, onerror: null })),
      clear: jest.fn(() => ({ onsuccess: null, onerror: null })),
      add: jest.fn(() => ({ onsuccess: null, onerror: null })),
    })),
    oncomplete: null,
    onerror: null,
  })),
}

global.indexedDB = {
  open: jest.fn(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: mockDB,
  })),
}

describe('storage', () => {
  it('exports storage functions', () => {
    expect(storage.saveList).toBeDefined()
    expect(storage.saveCard).toBeDefined()
    expect(storage.getAllLists).toBeDefined()
    expect(storage.getAllCards).toBeDefined()
  })
})
