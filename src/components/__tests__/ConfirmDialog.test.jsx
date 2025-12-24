import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmDialog from '../ConfirmDialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Test Dialog',
    message: 'Test message',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('Test Dialog')).toBeInTheDocument()
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />)
    const confirmButton = screen.getByText('Confirm')
    fireEvent.click(confirmButton)
    expect(defaultProps.onConfirm).toHaveBeenCalled()
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />)
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    expect(defaultProps.onCancel).toHaveBeenCalled()
  })

  it('calls onCancel when Escape key is pressed', () => {
    render(<ConfirmDialog {...defaultProps} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(defaultProps.onCancel).toHaveBeenCalled()
  })
})
