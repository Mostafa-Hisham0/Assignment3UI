let serverData = {
  lists: [],
  cards: [],
}

let requestDelay = 500
let failureRate = 0

export const setRequestDelay = (delay) => {
  requestDelay = delay
}

export const setFailureRate = (rate) => {
  failureRate = Math.max(0, Math.min(1, rate))
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const shouldFail = () => Math.random() < failureRate

const simulateRequest = async () => {
  await delay(requestDelay)
  if (shouldFail()) {
    throw new Error('Simulated server error')
  }
}

export const fetchLists = async () => {
  await simulateRequest()
  return [...serverData.lists]
}

export const fetchCards = async () => {
  await simulateRequest()
  return [...serverData.cards]
}

export const createList = async (list) => {
  await simulateRequest()
  const newList = {
    ...list,
    id: list.id || `list-${Date.now()}-${Math.random()}`,
    version: 1,
    lastModifiedAt: new Date().toISOString(),
  }
  serverData.lists.push(newList)
  return { ...newList }
}

export const updateList = async (listId, updates) => {
  await simulateRequest()
  const index = serverData.lists.findIndex((l) => l.id === listId)
  if (index === -1) {
    throw new Error('List not found')
  }
  const updated = {
    ...serverData.lists[index],
    ...updates,
    version: (serverData.lists[index].version || 1) + 1,
    lastModifiedAt: new Date().toISOString(),
  }
  serverData.lists[index] = updated
  return { ...updated }
}

export const deleteList = async (listId) => {
  await simulateRequest()
  const index = serverData.lists.findIndex((l) => l.id === listId)
  if (index === -1) {
    throw new Error('List not found')
  }
  serverData.lists.splice(index, 1)
  serverData.cards = serverData.cards.filter((c) => c.listId !== listId)
  return { success: true }
}

export const createCard = async (card) => {
  await simulateRequest()
  const newCard = {
    ...card,
    id: card.id || `card-${Date.now()}-${Math.random()}`,
    version: 1,
    lastModifiedAt: new Date().toISOString(),
  }
  serverData.cards.push(newCard)
  return { ...newCard }
}

export const updateCard = async (cardId, updates) => {
  await simulateRequest()
  const index = serverData.cards.findIndex((c) => c.id === cardId)
  if (index === -1) {
    throw new Error('Card not found')
  }
  const updated = {
    ...serverData.cards[index],
    ...updates,
    version: (serverData.cards[index].version || 1) + 1,
    lastModifiedAt: new Date().toISOString(),
  }
  serverData.cards[index] = updated
  return { ...updated }
}

export const deleteCard = async (cardId) => {
  await simulateRequest()
  const index = serverData.cards.findIndex((c) => c.id === cardId)
  if (index === -1) {
    throw new Error('Card not found')
  }
  serverData.cards.splice(index, 1)
  return { success: true }
}

export const moveCard = async (cardId, newListId, newIndex) => {
  await simulateRequest()
  const card = serverData.cards.find((c) => c.id === cardId)
  if (!card) {
    throw new Error('Card not found')
  }

  const oldListId = card.listId
  const oldListCards = serverData.cards
    .filter((c) => c.listId === oldListId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
  const newListCards = serverData.cards
    .filter((c) => c.listId === newListId && c.id !== cardId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  oldListCards.splice(oldListCards.findIndex((c) => c.id === cardId), 1)
  newListCards.splice(newIndex, 0, card)

  oldListCards.forEach((c, i) => {
    c.order = i
    c.lastModifiedAt = new Date().toISOString()
  })
  newListCards.forEach((c, i) => {
    c.order = i
    c.listId = newListId
    c.lastModifiedAt = new Date().toISOString()
  })

  return { success: true }
}

export const syncAll = async (lists, cards) => {
  await simulateRequest()
  serverData.lists = lists.map((l) => ({
    ...l,
    version: (l.version || 0) + 1,
    lastModifiedAt: new Date().toISOString(),
  }))
  serverData.cards = cards.map((c) => ({
    ...c,
    version: (c.version || 0) + 1,
    lastModifiedAt: new Date().toISOString(),
  }))
  return {
    lists: [...serverData.lists],
    cards: [...serverData.cards],
  }
}

export const resetServerData = () => {
  serverData = { lists: [], cards: [] }
}

