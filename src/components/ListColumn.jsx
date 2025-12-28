import { useMemo, useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FixedSizeList } from 'react-window'
import Card from './Card'
import InlineEditor from './InlineEditor'
import ConfirmDialog from './ConfirmDialog'

const ListColumn = ({
  list,
  cards,
  onCardClick,
  onCardEdit,
  onCardDelete,
  onCardMove: _onCardMove,
  onListRename,
  onListDelete,
  onListArchive,
  onAddCard,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
  })

  const [isAddingCard, setIsAddingCard] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [cards])

  const cardIds = useMemo(() => sortedCards.map((c) => c.id), [sortedCards])

  const handleAddCard = useCallback(
    (title) => {
      if (title.trim()) {
        onAddCard(list.id, { title: title.trim() })
      }
      setIsAddingCard(false)
    },
    [list.id, onAddCard]
  )

  const handleListRename = useCallback(
    (newTitle) => {
      if (newTitle.trim() && newTitle.trim() !== list.title) {
        onListRename(list.id, newTitle.trim())
      }
      setIsEditingTitle(false)
    },
    [list.id, list.title, onListRename]
  )

  const handleDeleteConfirm = useCallback(() => {
    onListDelete(list.id)
    setShowDeleteConfirm(false)
  }, [list.id, onListDelete])

  const handleArchive = useCallback(() => {
    onListArchive(list.id)
  }, [list.id, onListArchive])


  const shouldVirtualize = sortedCards.length > 30

  const Row = useCallback(
    ({ index, style }) => {
      const card = sortedCards[index]
      return (
        <div style={style}>
          <Card
            card={card}
            onEdit={onCardEdit}
            onDelete={onCardDelete}
            onClick={onCardClick}
          />
        </div>
      )
    },
    [sortedCards, onCardEdit, onCardDelete, onCardClick]
  )

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? 'bg-blue-100' : ''}`}
      role="region"
      aria-label={`List: ${list.title}`}
    >
      <div className="flex items-center justify-between mb-4">
        {isEditingTitle ? (
          <InlineEditor
            value={list.title}
            onSave={handleListRename}
            onCancel={() => setIsEditingTitle(false)}
            placeholder="List title"
            className="flex-1 font-bold text-lg"
          />
        ) : (
          <button
            type="button"
            className="font-bold text-lg cursor-pointer flex-1 text-left bg-transparent border-none p-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            onClick={() => setIsEditingTitle(true)}
            aria-label={`Edit list title: ${list.title}`}
          >
            {list.title}
          </button>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleArchive}
            className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
            aria-label={`Archive list ${list.title}`}
            title="Archive list"
          >
            📦
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2"
            aria-label={`Delete list ${list.title}`}
            title="Delete list"
          >
            ×
          </button>
        </div>
      </div>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        {shouldVirtualize ? (
          <div style={{ height: '600px' }}>
            <FixedSizeList
              height={600}
              itemCount={sortedCards.length}
              itemSize={120}
              width="100%"
            >
              {Row}
            </FixedSizeList>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedCards.map((card) => (
              <Card
                key={card.id}
                card={card}
                onEdit={onCardEdit}
                onDelete={onCardDelete}
                onClick={onCardClick}
              />
            ))}
          </div>
        )}
      </SortableContext>

      {isAddingCard ? (
        <div className="mt-2">
          <InlineEditor
            value=""
            onSave={handleAddCard}
            onCancel={() => setIsAddingCard(false)}
            placeholder="Enter card title..."
            className="w-full"
          />
        </div>
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          className="w-full mt-2 px-4 py-2 text-left text-gray-600 hover:bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Add card to ${list.title}`}
        >
          + Add a card
        </button>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete List"
        message={`Are you sure you want to delete "${list.title}"? This will also delete all cards in this list.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}

ListColumn.propTypes = {
  list: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    archived: PropTypes.bool,
  }).isRequired,
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  onCardClick: PropTypes.func.isRequired,
  onCardEdit: PropTypes.func.isRequired,
  onCardDelete: PropTypes.func.isRequired,
  onCardMove: PropTypes.func,
  onListRename: PropTypes.func.isRequired,
  onListDelete: PropTypes.func.isRequired,
  onListArchive: PropTypes.func.isRequired,
  onAddCard: PropTypes.func.isRequired,
}

export default ListColumn

