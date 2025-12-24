import { useMemo, useCallback, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { useBoard } from '../context/BoardProvider'
import ListColumn from './ListColumn'
import Card from './Card'
import CardDetailModal from './CardDetailModal'
import * as storage from '../services/storage'

const Board = () => {
  const {
    lists,
    cards,
    addList,
    updateList,
    deleteList,
    archiveList,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    reorderCards,
  } = useBoard()

  const [activeCard, setActiveCard] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const activeLists = useMemo(() => {
    return lists.filter((list) => !list.archived).sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [lists])

  const handleDragStart = useCallback((event) => {
    const { active } = event
    const card = cards.find((c) => c.id === active.id)
    setActiveCard(card)
  }, [cards])

  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event
      setActiveCard(null)

      if (!over) return

      const cardId = active.id
      const overId = over.id

      const card = cards.find((c) => c.id === cardId)
      if (!card) return

      const isOverList = lists.some((l) => l.id === overId)
      const isOverCard = cards.some((c) => c.id === overId)

      if (isOverList) {
        const targetList = lists.find((l) => l.id === overId)
        const targetCards = cards
          .filter((c) => c.listId === targetList.id)
          .sort((a, b) => (a.order || 0) - (b.order || 0))

        const newIndex = targetCards.length
        moveCard(cardId, overId, newIndex)

        try {
          await storage.saveCard({
            ...card,
            listId: overId,
            order: newIndex,
            lastModifiedAt: new Date().toISOString(),
          })
        } catch (error) {
          console.error('Failed to save card:', error)
        }
      } else if (isOverCard) {
        const overCard = cards.find((c) => c.id === overId)
        if (!overCard) return

        const sourceListId = card.listId
        const targetListId = overCard.listId

        if (sourceListId === targetListId) {
          const listCards = cards
            .filter((c) => c.listId === sourceListId)
            .sort((a, b) => (a.order || 0) - (b.order || 0))

          const oldIndex = listCards.findIndex((c) => c.id === cardId)
          const newIndex = listCards.findIndex((c) => c.id === overId)

          if (oldIndex !== newIndex) {
            const reordered = arrayMove(listCards, oldIndex, newIndex)
            const cardIds = reordered.map((c) => c.id)
            reorderCards(sourceListId, cardIds)

            try {
              await Promise.all(
                reordered.map((c, index) =>
                  storage.saveCard({
                    ...c,
                    order: index,
                    lastModifiedAt: new Date().toISOString(),
                  })
                )
              )
            } catch (error) {
              console.error('Failed to save reordered cards:', error)
            }
          }
        } else {
          const targetListCards = cards
            .filter((c) => c.listId === targetListId)
            .sort((a, b) => (a.order || 0) - (b.order || 0))

          const newIndex = targetListCards.findIndex((c) => c.id === overId)
          moveCard(cardId, targetListId, newIndex)

          try {
            await storage.saveCard({
              ...card,
              listId: targetListId,
              order: newIndex,
              lastModifiedAt: new Date().toISOString(),
            })
          } catch (error) {
            console.error('Failed to save card:', error)
          }
        }
      }
    },
    [cards, lists, moveCard, reorderCards]
  )

  const handleCardClick = useCallback((card) => {
    setSelectedCard(card)
    setIsModalOpen(true)
  }, [])

  const handleCardSave = useCallback(
    async (updatedCard) => {
      updateCard(updatedCard.id, {
        title: updatedCard.title,
        description: updatedCard.description,
        tags: updatedCard.tags,
      })

      try {
        await storage.saveCard({
          ...updatedCard,
          lastModifiedAt: new Date().toISOString(),
        })
      } catch (error) {
        console.error('Failed to save card:', error)
      }
    },
    [updateCard]
  )

  const handleCardDelete = useCallback(
    async (cardId) => {
      deleteCard(cardId)
      setIsModalOpen(false)
      setSelectedCard(null)

      try {
        await storage.deleteCard(cardId)
      } catch (error) {
        console.error('Failed to delete card:', error)
      }
    },
    [deleteCard]
  )

  const handleListRename = useCallback(
    async (listId, newTitle) => {
      updateList(listId, { title: newTitle })

      try {
        const list = lists.find((l) => l.id === listId)
        if (list) {
          await storage.saveList({
            ...list,
            title: newTitle,
            lastModifiedAt: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error('Failed to save list:', error)
      }
    },
    [lists, updateList]
  )

  const handleListDelete = useCallback(
    async (listId) => {
      deleteList(listId)

      try {
        await storage.deleteList(listId)
        const listCards = cards.filter((c) => c.listId === listId)
        await Promise.all(listCards.map((c) => storage.deleteCard(c.id)))
      } catch (error) {
        console.error('Failed to delete list:', error)
      }
    },
    [cards, deleteList]
  )

  const handleListArchive = useCallback(
    async (listId) => {
      archiveList(listId)

      try {
        const list = lists.find((l) => l.id === listId)
        if (list) {
          await storage.saveList({
            ...list,
            archived: true,
            lastModifiedAt: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error('Failed to archive list:', error)
      }
    },
    [lists, archiveList]
  )

  const handleAddCard = useCallback(
    async (listId, cardData) => {
      addCard(listId, cardData)

      try {
        const newCard = {
          id: cardData.id || `card-${Date.now()}`,
          listId,
          ...cardData,
          order: cards.filter((c) => c.listId === listId).length,
          version: 1,
          lastModifiedAt: new Date().toISOString(),
        }
        await storage.saveCard(newCard)
      } catch (error) {
        console.error('Failed to save card:', error)
      }
    },
    [addCard, cards]
  )

  return (
    <div className="kanban-board">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex overflow-x-auto pb-4" role="main" aria-label="Kanban board">
          <SortableContext items={activeLists.map((l) => l.id)} strategy={rectSortingStrategy}>
            {activeLists.map((list) => {
              const listCards = cards.filter((c) => c.listId === list.id)
              return (
                <ListColumn
                  key={list.id}
                  list={list}
                  cards={listCards}
                  onCardClick={handleCardClick}
                  onCardEdit={handleCardClick}
                  onCardDelete={deleteCard}
                  onCardMove={moveCard}
                  onListRename={handleListRename}
                  onListDelete={handleListDelete}
                  onListArchive={handleListArchive}
                  onAddCard={handleAddCard}
                />
              )
            })}
          </SortableContext>
        </div>
        <DragOverlay>
          {activeCard ? <Card card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>

      <CardDetailModal
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCard(null)
        }}
        onSave={handleCardSave}
        onDelete={handleCardDelete}
      />
    </div>
  )
}

export default Board

