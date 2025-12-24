import * as api from '../api'

describe('api', () => {
  beforeEach(() => {
    api.resetServerData()
  })

  it('exports API functions', () => {
    expect(api.fetchLists).toBeDefined()
    expect(api.fetchCards).toBeDefined()
    expect(api.createList).toBeDefined()
    expect(api.createCard).toBeDefined()
  })

  it('creates a list', async () => {
    const list = await api.createList({ title: 'Test List' })
    expect(list.title).toBe('Test List')
    expect(list.id).toBeDefined()
  })

  it('creates a card', async () => {
    const list = await api.createList({ title: 'Test List' })
    const card = await api.createCard({ listId: list.id, title: 'Test Card' })
    expect(card.title).toBe('Test Card')
    expect(card.listId).toBe(list.id)
  })

  it('fetches lists', async () => {
    await api.createList({ title: 'Test List' })
    const lists = await api.fetchLists()
    expect(lists.length).toBeGreaterThan(0)
  })
})
