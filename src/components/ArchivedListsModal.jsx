import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const ArchivedListsModal = ({ isOpen, archivedLists, onRestore, onDelete, onClose }) => {
  const modalRef = useRef(null)
  const firstButtonRef = useRef(null)

  useEffect(() => {
    if (isOpen && firstButtonRef.current) {
      firstButtonRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
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
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleBackdropKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (e.target === e.currentTarget) {
        onClose()
      }
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="archived-modal-title"
      tabIndex={-1}
    >
      <div className="modal-content max-w-2xl" ref={modalRef} role="document">
        <h2 id="archived-modal-title" className="text-2xl font-bold mb-4">
          Archived Lists
        </h2>

        {archivedLists.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>No archived lists found.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {archivedLists.map((list) => (
              <div
                key={list.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{list.title}</h3>
                  {list.lastModifiedAt && (
                    <p className="text-sm text-gray-500 mt-1">
                      Archived: {new Date(list.lastModifiedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    ref={archivedLists[0]?.id === list.id ? firstButtonRef : null}
                    onClick={() => onRestore(list.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Restore list ${list.title}`}
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => onDelete(list.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Delete list ${list.title}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Close"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

ArchivedListsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  archivedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      lastModifiedAt: PropTypes.string,
    })
  ).isRequired,
  onRestore: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default ArchivedListsModal

