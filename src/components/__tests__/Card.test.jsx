import { render, screen } from '@testing-library/react'
import Card from '../Card'

const mockCard = {
  id: '1',
  title: 'Test Card',
  description: 'Test Description',
  tags: ['tag1', 'tag2'],
  listId: 'list1',
}

describe('Card', () => {
  it('renders card title', () => {
    render(<Card card={mockCard} onEdit={jest.fn()} onDelete={jest.fn()} />)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
  })

  it('renders card description', () => {
    render(<Card card={mockCard} onEdit={jest.fn()} onDelete={jest.fn()} />)
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders tags', () => {
    render(<Card card={mockCard} onEdit={jest.fn()} onDelete={jest.fn()} />)
    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const handleClick = jest.fn()
    render(
      <Card card={mockCard} onEdit={jest.fn()} onDelete={jest.fn()} onClick={handleClick} />
    )
    const card = screen.getByRole('button', { name: /card: test card/i })
    card.click()
    expect(handleClick).toHaveBeenCalledWith(mockCard)
  })
})

