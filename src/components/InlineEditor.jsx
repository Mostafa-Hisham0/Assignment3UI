import { useState, useEffect, useRef } from 'react'

const InlineEditor = ({
  value,
  onSave,
  onCancel,
  placeholder = 'Enter text...',
  className = '',
  multiline = false,
  autoFocus = true,
}) => {
  const [editValue, setEditValue] = useState(value || '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current.select) {
        inputRef.current.select()
      }
    }
  }, [autoFocus])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Enter' && e.shiftKey && multiline) {
      return
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleSave = () => {
    if (editValue.trim() !== value) {
      onSave(editValue.trim())
    } else {
      onCancel()
    }
  }

  const handleCancel = () => {
    setEditValue(value || '')
    onCancel()
  }

  const handleBlur = () => {
    handleSave()
  }

  if (multiline) {
    return (
      <textarea
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`inline-editor ${className}`}
        rows={3}
        aria-label="Edit text"
      />
    )
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`inline-editor ${className}`}
      aria-label="Edit text"
    />
  )
}

export default InlineEditor

