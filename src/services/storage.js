const DB_NAME = 'KanbanBoardDB'
const DB_VERSION = 1
const STORE_LISTS = 'lists'
const STORE_CARDS = 'cards'
const STORE_SYNC_QUEUE = 'syncQueue'

let db = null

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      if (!database.objectStoreNames.contains(STORE_LISTS)) {
        const listStore = database.createObjectStore(STORE_LISTS, { keyPath: 'id' })
        listStore.createIndex('lastModifiedAt', 'lastModifiedAt', { unique: false })
      }

      if (!database.objectStoreNames.contains(STORE_CARDS)) {
        const cardStore = database.createObjectStore(STORE_CARDS, { keyPath: 'id' })
        cardStore.createIndex('listId', 'listId', { unique: false })
        cardStore.createIndex('lastModifiedAt', 'lastModifiedAt', { unique: false })
      }

      if (!database.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
        const syncStore = database.createObjectStore(STORE_SYNC_QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        })
        syncStore.createIndex('type', 'type', { unique: false })
        syncStore.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

export const saveList = async (list) => {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_LISTS], 'readwrite')
    const store = transaction.objectStore(STORE_LISTS)
    const request = store.put(list)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const saveCard = async (card) => {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_CARDS], 'readwrite')
    const store = transaction.objectStore(STORE_CARDS)
    const request = store.put(card)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const getAllLists = async () => {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_LISTS], 'readonly')
    const store = transaction.objectStore(STORE_LISTS)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export const getAllCards = async () => {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_CARDS], 'readonly')
    const store = transaction.objectStore(STORE_CARDS)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export const deleteList = async (listId) => {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_LISTS], 'readwrite')
    const store = transaction.objectStore(STORE_LISTS)
    const request = store.delete(listId)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const deleteCard = async (cardId) => {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_CARDS], 'readwrite')
    const store = transaction.objectStore(STORE_CARDS)
    const request = store.delete(cardId)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const addToSyncQueue = async (action) => {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_SYNC_QUEUE], 'readwrite')
    const store = transaction.objectStore(STORE_SYNC_QUEUE)
    const request = store.add({
      ...action,
      timestamp: Date.now(),
    })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const getSyncQueue = async () => {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_SYNC_QUEUE], 'readonly')
    const store = transaction.objectStore(STORE_SYNC_QUEUE)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export const removeFromSyncQueue = async (id) => {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_SYNC_QUEUE], 'readwrite')
    const store = transaction.objectStore(STORE_SYNC_QUEUE)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const clearSyncQueue = async () => {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_SYNC_QUEUE], 'readwrite')
    const store = transaction.objectStore(STORE_SYNC_QUEUE)
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const saveAllData = async (lists, cards) => {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_LISTS, STORE_CARDS], 'readwrite')
    const listStore = transaction.objectStore(STORE_LISTS)
    const cardStore = transaction.objectStore(STORE_CARDS)

    listStore.clear()
    cardStore.clear()

    lists.forEach((list) => listStore.put(list))
    cards.forEach((card) => cardStore.put(card))

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

