import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import InlineEditor from './InlineEditor'
import { validateCard, validateTag } from '../utils/validators'

const CardDetailModal = ({ card, isOpen, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState(card?.title || '')
  const [description, setDescription] = useState(card?.description || '')
  const [tags, setTags] = useState(card?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState({})
  const modalRef = useRef(null)
  const titleInputRef = useRef(null)

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen && card) {
      setTitle(card.title || '')
      setDescription(card.description || '')
      setTags(card.tags || [])
      setNewTag('')
      setErrors({})
    }
  }, [isOpen, card])

  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleClose])

  const handleSave = useCallback(() => {
    const validation = validateCard({ title, description, tags })
    if (!validation.valid) {
      setErrors({ general: validation.error })
      return
    }

    if (onSave) {
      onSave({
        ...card,
        title,
        description,
        tags,
      })
    }
    handleClose()
  }, [title, description, tags, card, onSave, handleClose])

  const handleDelete = useCallback(() => {
    if (onDelete && window.confirm('Are you sure you want to delete this card?')) {
      onDelete(card.id)
      handleClose()
    }
  }, [card, onDelete, handleClose])

  const handleAddTag = useCallback(() => {
    const validation = validateTag(newTag)
    if (!validation.valid) {
      setErrors({ tag: validation.error })
      return
    }

    if (!tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
      setErrors({})
    }
  }, [newTag, tags])

  const handleRemoveTag = useCallback(
    (tagToRemove) => {
      setTags(tags.filter((tag) => tag !== tagToRemove))
    },
    [tags]
  )

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        handleClose()
      }
    },
    [handleSave, handleClose]
  )

  if (!isOpen || !card) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
      tabIndex={-1}
    >
      <div className="modal-content" ref={modalRef} role="document">
        <div className="mb-4">
          <h2 id="card-modal-title" className="text-2xl font-bold mb-2">
            <InlineEditor
              value={title}
              onSave={setTitle}
              onCancel={() => setTitle(card.title)}
              placeholder="Card title"
              className="w-full text-2xl font-bold"
            />
          </h2>
        </div>

        <div className="mb-4">
          <label htmlFor="card-description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <InlineEditor
            value={description}
            onSave={setDescription}
            onCancel={() => setDescription(card.description)}
            placeholder="Add a description..."
            className="w-full"
            multiline={true}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="card-tags" className="block text-sm font-medium mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="tag bg-blue-100 text-blue-800 flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-blue-800 hover:text-blue-900 focus:outline-none"
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              id="card-tags"
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              placeholder="Add a tag"
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Add tag"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Add tag"
            >
              Add
            </button>
          </div>
          {errors.tag && <p className="text-red-600 text-sm mt-1">{errors.tag}</p>}
        </div>

        {errors.general && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded" role="alert">
            {errors.general}
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Delete card"
          >
            Delete Card
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Close"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Save card"
            >
              Save (Ctrl+Enter)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

CardDetailModal.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default CardDetailModal

