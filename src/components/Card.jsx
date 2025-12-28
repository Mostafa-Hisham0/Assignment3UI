import { memo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const Card = memo(({ card, onEdit: _onEdit, onDelete, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(card)
    }
  }, [card, onClick])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          onDelete(card.id)
        }
      }
    },
    [card.id, handleClick, onDelete]
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-card ${isDragging ? 'dragging' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Card: ${card.title}`}
      aria-describedby={`card-description-${card.id}`}
    >
      <h3 className="font-semibold text-gray-800 mb-2">{card.title}</h3>
      {card.description && (
        <p
          id={`card-description-${card.id}`}
          className="text-sm text-gray-600 mb-2 line-clamp-2"
        >
          {card.description}
        </p>
      )}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2" role="list" aria-label="Tags">
          {card.tags.map((tag, index) => (
            <span
              key={index}
              className="tag bg-blue-100 text-blue-800"
              role="listitem"
              aria-label={`Tag: ${tag}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
})

Card.displayName = 'Card'

Card.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onClick: PropTypes.func,
}

export default Card

