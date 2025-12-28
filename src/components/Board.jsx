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

const Board = () => {
  const {
    lists,
    cards,
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
    (event) => {
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
          }
        } else {
          const targetListCards = cards
            .filter((c) => c.listId === targetListId)
            .sort((a, b) => (a.order || 0) - (b.order || 0))

          const newIndex = targetListCards.findIndex((c) => c.id === overId)
          moveCard(cardId, targetListId, newIndex)
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
    (updatedCard) => {
      updateCard(updatedCard.id, {
        title: updatedCard.title,
        description: updatedCard.description,
        tags: updatedCard.tags,
      })
    },
    [updateCard]
  )

  const handleCardDelete = useCallback(
    (cardId) => {
      deleteCard(cardId)
      setIsModalOpen(false)
      setSelectedCard(null)
    },
    [deleteCard]
  )

  const handleListRename = useCallback(
    (listId, newTitle) => {
      updateList(listId, { title: newTitle })
    },
    [updateList]
  )

  const handleListDelete = useCallback(
    (listId) => {
      deleteList(listId)
    },
    [deleteList]
  )

  const handleListArchive = useCallback(
    (listId) => {
      archiveList(listId)
    },
    [archiveList]
  )

  const handleAddCard = useCallback(
    (listId, cardData) => {
      addCard(listId, cardData)
    },
    [addCard]
  )

  if (activeLists.length === 0) {
    return (
      <div className="kanban-board flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Welcome to Kanban Board</h2>
          <p className="mb-4">Get started by creating your first list!</p>
          <p className="text-sm opacity-75">Click &quot;Add List&quot; in the toolbar above</p>
        </div>
      </div>
    )
  }

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

