import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const ConflictResolutionModal = ({
  isOpen,
  conflict,
  onResolve,
  onCancel,
}) => {
  const [resolution, setResolution] = useState('server')
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
        onCancel()
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
  }, [isOpen, onCancel])

  if (!isOpen || !conflict) return null

  const handleResolve = () => {
    onResolve(conflict, resolution)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  const handleBackdropKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (e.target === e.currentTarget) {
        onCancel()
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
      aria-labelledby="conflict-modal-title"
      tabIndex={-1}
    >
      <div className="modal-content" ref={modalRef} role="document">
        <h2 id="conflict-modal-title" className="text-2xl font-bold mb-4">
          Conflict Detected
        </h2>
        <p className="mb-4 text-gray-700">
          There is a conflict between your local changes and the server version for{' '}
          {conflict.type === 'list' ? 'list' : 'card'}: <strong>{conflict.name}</strong>
        </p>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Local Version:</h3>
          <div className="bg-blue-50 p-3 rounded mb-4">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(conflict.local, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Server Version:</h3>
          <div className="bg-green-50 p-3 rounded mb-4">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(conflict.server, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mb-6">
          <div className="block font-semibold mb-2">Choose which version to keep:</div>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="local"
                checked={resolution === 'local'}
                onChange={(e) => setResolution(e.target.value)}
                className="mr-2"
                ref={firstButtonRef}
              />
              Keep Local Version
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="server"
                checked={resolution === 'server'}
                onChange={(e) => setResolution(e.target.value)}
                className="mr-2"
              />
              Keep Server Version
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="merge"
                checked={resolution === 'merge'}
                onChange={(e) => setResolution(e.target.value)}
                className="mr-2"
              />
              Merge (Auto)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Resolve conflict"
          >
            Resolve
          </button>
        </div>
      </div>
    </div>
  )
}

ConflictResolutionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  conflict: PropTypes.shape({
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    local: PropTypes.object.isRequired,
    server: PropTypes.object.isRequired,
  }).isRequired,
  onResolve: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default ConflictResolutionModal

