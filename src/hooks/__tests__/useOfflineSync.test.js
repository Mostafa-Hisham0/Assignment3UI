import { renderHook, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react'
import { useOfflineSync } from '../useOfflineSync'
import { BoardProvider } from '../../context/BoardProvider'
import * as storage from '../../services/storage'
import * as api from '../../services/api'

jest.mock('../../services/storage')
jest.mock('../../services/api')

const wrapper = ({ children }) => <BoardProvider>{children}</BoardProvider>

describe('useOfflineSync', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
      configurable: true,
    })
    storage.getAllLists.mockResolvedValue([])
    storage.getAllCards.mockResolvedValue([])
    storage.saveList.mockResolvedValue()
    storage.saveCard.mockResolvedValue()
    storage.getSyncQueue.mockResolvedValue([])
    storage.addToSyncQueue.mockResolvedValue()
    storage.removeFromSyncQueue.mockResolvedValue()
    api.fetchLists.mockResolvedValue([])
    api.fetchCards.mockResolvedValue([])
  })

  it('returns sync functions', () => {
    const { result } = renderHook(() => useOfflineSync(), { wrapper })
    expect(result.current.syncWithServer).toBeDefined()
    expect(result.current.queueAction).toBeDefined()
  })

  it('saves to storage when lists or cards change', async () => {
    const { result, rerender } = renderHook(() => useOfflineSync(), { wrapper })
    await waitFor(() => {
      expect(storage.saveList).toHaveBeenCalled()
    })
  })

  it('syncs with server when online', async () => {
    const { result } = renderHook(() => useOfflineSync(), { wrapper })
    await act(async () => {
      await result.current.syncWithServer()
    })
    expect(api.fetchLists).toHaveBeenCalled()
    expect(api.fetchCards).toHaveBeenCalled()
  })

  it('does not sync when offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    })
    const { result } = renderHook(() => useOfflineSync(), { wrapper })
    await act(async () => {
      await result.current.syncWithServer()
    })
    expect(api.fetchLists).not.toHaveBeenCalled()
  })

  it('queues action when offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    })
    const { result } = renderHook(() => useOfflineSync(), { wrapper })
    const action = { type: 'CREATE_CARD', payload: { id: '1', title: 'Test' } }
    await act(async () => {
      await result.current.queueAction(action)
    })
    expect(storage.addToSyncQueue).toHaveBeenCalledWith(action)
  })

  it('processes sync queue when online', async () => {
    const queueItem = {
      id: 'queue-1',
      type: 'CREATE_CARD',
      payload: { id: 'card-1', title: 'Test Card' },
    }
    storage.getSyncQueue.mockResolvedValue([queueItem])
    api.createCard.mockResolvedValue({ id: 'card-1', title: 'Test Card' })

    const { result } = renderHook(() => useOfflineSync(), { wrapper })
    await act(async () => {
      await result.current.syncWithServer()
    })
    expect(api.createCard).toHaveBeenCalledWith(queueItem.payload)
    expect(storage.removeFromSyncQueue).toHaveBeenCalledWith(queueItem.id)
  })

  it('handles online event and triggers sync', async () => {
    const { result } = renderHook(() => useOfflineSync(), { wrapper })
    const onlineEvent = new Event('online')
    await act(async () => {
      window.dispatchEvent(onlineEvent)
      await new Promise((resolve) => setTimeout(resolve, 100))
    })
    expect(api.fetchLists).toHaveBeenCalled()
  })

  it('handles offline event', async () => {
    const { result } = renderHook(() => useOfflineSync(), { wrapper })
    const offlineEvent = new Event('offline')
    await act(async () => {
      window.dispatchEvent(offlineEvent)
    })
    await act(async () => {
      await result.current.syncWithServer()
    })
    expect(api.fetchLists).not.toHaveBeenCalled()
  })

  it('handles sync errors gracefully', async () => {
    api.fetchLists.mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useOfflineSync(), { wrapper })
    await act(async () => {
      await result.current.syncWithServer()
    })
    expect(storage.getSyncQueue).toHaveBeenCalled()
  })

  it('merges server and local data when server is newer', async () => {
    const serverList = {
      id: 'list-1',
      title: 'Server Title',
      version: 3,
      lastModifiedAt: new Date().toISOString(),
    }
    const localList = {
      id: 'list-1',
      title: 'Local Title',
      version: 2,
      lastModifiedAt: new Date(Date.now() - 10000).toISOString(),
    }
    storage.getAllLists.mockResolvedValue([localList])
    api.fetchLists.mockResolvedValue([serverList])

    const { result } = renderHook(() => useOfflineSync(), { wrapper })
    await act(async () => {
      await result.current.syncWithServer()
    })
    expect(storage.saveList).toHaveBeenCalled()
  })
})
