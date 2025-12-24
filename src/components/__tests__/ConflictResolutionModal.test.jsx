import { render, screen, fireEvent } from '@testing-library/react'
import ConflictResolutionModal from '../ConflictResolutionModal'

const mockConflict = {
  type: 'list',
  name: 'Test List',
  local: { id: '1', title: 'Local Title', version: 2 },
  server: { id: '1', title: 'Server Title', version: 3 },
}

describe('ConflictResolutionModal', () => {
  it('renders when open', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        conflict={mockConflict}
        onResolve={jest.fn()}
        onCancel={jest.fn()}
      />
    )
    expect(screen.getByText('Conflict Detected')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <ConflictResolutionModal
        isOpen={false}
        conflict={mockConflict}
        onResolve={jest.fn()}
        onCancel={jest.fn()}
      />
    )
    expect(screen.queryByText('Conflict Detected')).not.toBeInTheDocument()
  })

  it('displays local and server versions', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        conflict={mockConflict}
        onResolve={jest.fn()}
        onCancel={jest.fn()}
      />
    )
    expect(screen.getByText('Local Version:')).toBeInTheDocument()
    expect(screen.getByText('Server Version:')).toBeInTheDocument()
  })

  it('calls onResolve with selected resolution', () => {
    const onResolve = jest.fn()
    render(
      <ConflictResolutionModal
        isOpen={true}
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={jest.fn()}
      />
    )
    const resolveButton = screen.getByText('Resolve')
    fireEvent.click(resolveButton)
    expect(onResolve).toHaveBeenCalledWith(mockConflict, 'server')
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn()
    render(
      <ConflictResolutionModal
        isOpen={true}
        conflict={mockConflict}
        onResolve={jest.fn()}
        onCancel={onCancel}
      />
    )
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onCancel when Escape is pressed', () => {
    const onCancel = jest.fn()
    render(
      <ConflictResolutionModal
        isOpen={true}
        conflict={mockConflict}
        onResolve={jest.fn()}
        onCancel={onCancel}
      />
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalled()
  })

  it('allows selecting different resolutions', () => {
    const onResolve = jest.fn()
    render(
      <ConflictResolutionModal
        isOpen={true}
        conflict={mockConflict}
        onResolve={onResolve}
        onCancel={jest.fn()}
      />
    )
    const localRadio = screen.getByLabelText('Keep Local Version')
    fireEvent.click(localRadio)
    const resolveButton = screen.getByText('Resolve')
    fireEvent.click(resolveButton)
    expect(onResolve).toHaveBeenCalledWith(mockConflict, 'local')
  })
})

