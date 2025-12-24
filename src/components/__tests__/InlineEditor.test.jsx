import { render, screen, fireEvent } from '@testing-library/react'
import InlineEditor from '../InlineEditor'

describe('InlineEditor', () => {
  it('renders input with value', () => {
    render(<InlineEditor value="Test" onSave={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
  })

  it('calls onSave when Enter is pressed', () => {
    const onSave = jest.fn()
    render(<InlineEditor value="Test" onSave={onSave} onCancel={jest.fn()} />)
    const input = screen.getByDisplayValue('Test')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSave).toHaveBeenCalledWith('Test')
  })

  it('calls onCancel when Escape is pressed', () => {
    const onCancel = jest.fn()
    render(<InlineEditor value="Test" onSave={jest.fn()} onCancel={onCancel} />)
    const input = screen.getByDisplayValue('Test')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalled()
  })
})

