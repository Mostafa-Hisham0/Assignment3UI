import { useEffect, useCallback, useRef } from 'react'
import { useBoard } from '../context/BoardProvider'
import { ACTION_TYPES } from '../context/boardReducer'
import * as storage from '../services/storage'
import * as api from '../services/api'
import { mergeObjects } from '../utils/helpers'

/**
 * Custom hook for handling offline synchronization
 * Manages persistence, sync queue, retry logic, and server interactions
 */
export const useOfflineSync = () => {
  const { lists, cards, dispatch } = useBoard()
  const syncIntervalRef = useRef(null)
  const isOnlineRef = useRef(navigator.onLine)

  const saveToStorage = useCallback(async () => {
    try {
      await Promise.all([
        ...lists.map((list) => storage.saveList(list)),
        ...cards.map((card) => storage.saveCard(card)),
      ])
    } catch (error) {
      console.error('Failed to save to storage:', error)
    }
  }, [lists, cards])

  const syncWithServer = useCallback(async () => {
    if (!isOnlineRef.current) {
      return
    }

    try {
      const serverLists = await api.fetchLists()
      const serverCards = await api.fetchCards()

      const syncQueue = await storage.getSyncQueue()

      if (syncQueue.length > 0) {
        for (const action of syncQueue) {
          try {
            switch (action.type) {
              case 'CREATE_LIST':
                await api.createList(action.payload)
                break
              case 'UPDATE_LIST':
                await api.updateList(action.payload.id, action.payload)
                break
              case 'DELETE_LIST':
                await api.deleteList(action.payload.id)
                break
              case 'CREATE_CARD':
                await api.createCard(action.payload)
                break
              case 'UPDATE_CARD':
                await api.updateCard(action.payload.id, action.payload)
                break
              case 'DELETE_CARD':
                await api.deleteCard(action.payload.id)
                break
              case 'MOVE_CARD':
                await api.moveCard(
                  action.payload.cardId,
                  action.payload.newListId,
                  action.payload.newIndex
                )
                break
            }
            await storage.removeFromSyncQueue(action.id)
          } catch (error) {
            console.error('Failed to sync action:', error)
          }
        }
      }

      const mergedLists = lists.map((localList) => {
        const serverList = serverLists.find((sl) => sl.id === localList.id)
        if (!serverList) return localList

        if (new Date(serverList.lastModifiedAt) > new Date(localList.lastModifiedAt)) {
          const baseList = { ...localList, version: (localList.version || 1) - 1 }
          return mergeObjects(baseList, localList, serverList)
        }
        return localList
      })

      const mergedCards = cards.map((localCard) => {
        const serverCard = serverCards.find((sc) => sc.id === localCard.id)
        if (!serverCard) return localCard

        if (new Date(serverCard.lastModifiedAt) > new Date(localCard.lastModifiedAt)) {
          const baseCard = { ...localCard, version: (localCard.version || 1) - 1 }
          return mergeObjects(baseCard, localCard, serverCard)
        }
        return localCard
      })

      const newServerLists = serverLists.filter(
        (sl) => !lists.some((ll) => ll.id === sl.id)
      )
      const newServerCards = serverCards.filter(
        (sc) => !cards.some((lc) => lc.id === sc.id)
      )

      dispatch({
        type: ACTION_TYPES.SET_INITIAL_STATE,
        payload: {
          lists: [...mergedLists, ...newServerLists],
          cards: [...mergedCards, ...newServerCards],
        },
      })

      await saveToStorage()
      dispatch({ type: ACTION_TYPES.SYNC_SUCCESS })
    } catch (error) {
      console.error('Sync failed:', error)
      dispatch({ type: ACTION_TYPES.SYNC_FAILURE })
    }
  }, [lists, cards, dispatch, ACTION_TYPES, saveToStorage])

  const queueAction = useCallback(
    async (action) => {
      if (isOnlineRef.current) {
        try {
          await syncWithServer()
        } catch (error) {
          await storage.addToSyncQueue(action)
        }
      } else {
        await storage.addToSyncQueue(action)
      }
    },
    [syncWithServer]
  )

  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true
      syncWithServer()
    }

    const handleOffline = () => {
      isOnlineRef.current = false
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    syncIntervalRef.current = setInterval(() => {
      if (isOnlineRef.current) {
        syncWithServer()
      }
    }, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [syncWithServer])

  useEffect(() => {
    saveToStorage()
  }, [lists, cards, saveToStorage])

  return {
    syncWithServer,
    queueAction,
    isOnline: isOnlineRef.current,
  }
}

