import { http, HttpResponse } from 'msw'

let serverData = {
  lists: [],
  cards: [],
}

export const handlers = [
  http.get('/api/lists', () => {
    return HttpResponse.json(serverData.lists)
  }),

  http.get('/api/cards', () => {
    return HttpResponse.json(serverData.cards)
  }),

  http.post('/api/lists', async ({ request }) => {
    const list = await request.json()
    const newList = {
      ...list,
      id: list.id || `list-${Date.now()}-${Math.random()}`,
      version: 1,
      lastModifiedAt: new Date().toISOString(),
    }
    serverData.lists.push(newList)
    return HttpResponse.json(newList, { status: 201 })
  }),

  http.put('/api/lists/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json()
    const index = serverData.lists.findIndex((l) => l.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'List not found' }, { status: 404 })
    }
    const updated = {
      ...serverData.lists[index],
      ...updates,
      version: (serverData.lists[index].version || 1) + 1,
      lastModifiedAt: new Date().toISOString(),
    }
    serverData.lists[index] = updated
    return HttpResponse.json(updated)
  }),

  http.delete('/api/lists/:id', ({ params }) => {
    const { id } = params
    const index = serverData.lists.findIndex((l) => l.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'List not found' }, { status: 404 })
    }
    serverData.lists.splice(index, 1)
    serverData.cards = serverData.cards.filter((c) => c.listId !== id)
    return HttpResponse.json({ success: true })
  }),

  http.post('/api/cards', async ({ request }) => {
    const card = await request.json()
    const newCard = {
      ...card,
      id: card.id || `card-${Date.now()}-${Math.random()}`,
      version: 1,
      lastModifiedAt: new Date().toISOString(),
    }
    serverData.cards.push(newCard)
    return HttpResponse.json(newCard, { status: 201 })
  }),

  http.put('/api/cards/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json()
    const index = serverData.cards.findIndex((c) => c.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Card not found' }, { status: 404 })
    }
    const updated = {
      ...serverData.cards[index],
      ...updates,
      version: (serverData.cards[index].version || 1) + 1,
      lastModifiedAt: new Date().toISOString(),
    }
    serverData.cards[index] = updated
    return HttpResponse.json(updated)
  }),

  http.delete('/api/cards/:id', ({ params }) => {
    const { id } = params
    const index = serverData.cards.findIndex((c) => c.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Card not found' }, { status: 404 })
    }
    serverData.cards.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  http.post('/api/cards/:id/move', async ({ params, request }) => {
    const { id } = params
    const { newListId, newIndex } = await request.json()
    const card = serverData.cards.find((c) => c.id === id)
    if (!card) {
      return HttpResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const oldListId = card.listId
    const oldListCards = serverData.cards
      .filter((c) => c.listId === oldListId)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
    const newListCards = serverData.cards
      .filter((c) => c.listId === newListId && c.id !== id)
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    oldListCards.splice(oldListCards.findIndex((c) => c.id === id), 1)
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

    return HttpResponse.json({ success: true })
  }),

  http.post('/api/sync', async ({ request }) => {
    const { lists, cards } = await request.json()
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
    return HttpResponse.json({
      lists: [...serverData.lists],
      cards: [...serverData.cards],
    })
  }),
]

export const resetServerData = () => {
  serverData = { lists: [], cards: [] }
}

export const getServerData = () => ({ ...serverData })

