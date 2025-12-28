import { render, screen, fireEvent } from '@testing-library/react'
import PropTypes from 'prop-types'
import ListColumn from '../ListColumn'
import { DndContext } from '@dnd-kit/core'

const mockList = {
  id: 'list-1',
  title: 'Test List',
  order: 0,
  archived: false,
}

const mockCards = [
  { id: 'card-1', listId: 'list-1', title: 'Card 1', order: 0 },
  { id: 'card-2', listId: 'list-1', title: 'Card 2', order: 1 },
]

const defaultProps = {
  list: mockList,
  cards: mockCards,
  onCardClick: jest.fn(),
  onCardEdit: jest.fn(),
  onCardDelete: jest.fn(),
  onCardMove: jest.fn(),
  onListRename: jest.fn(),
  onListDelete: jest.fn(),
  onListArchive: jest.fn(),
  onAddCard: jest.fn(),
}

const Wrapper = ({ children }) => (
  <DndContext>
    {children}
  </DndContext>
)
Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
}

describe('ListColumn', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders list title', () => {
    render(
      <Wrapper>
        <ListColumn {...defaultProps} />
      </Wrapper>
    )
    expect(screen.getByText('Test List')).toBeInTheDocument()
  })

  it('renders cards', () => {
    render(
      <Wrapper>
        <ListColumn {...defaultProps} />
      </Wrapper>
    )
    expect(screen.getByText('Card 1')).toBeInTheDocument()
    expect(screen.getByText('Card 2')).toBeInTheDocument()
  })

  it('calls onListArchive when archive button is clicked', () => {
    render(
      <Wrapper>
        <ListColumn {...defaultProps} />
      </Wrapper>
    )
    const archiveButton = screen.getByLabelText(/archive list/i)
    fireEvent.click(archiveButton)
    expect(defaultProps.onListArchive).toHaveBeenCalledWith('list-1')
  })

  it('calls onListDelete when delete button is clicked and confirmed', () => {
    render(
      <Wrapper>
        <ListColumn {...defaultProps} />
      </Wrapper>
    )
    const deleteButton = screen.getByLabelText(/delete list/i)
    fireEvent.click(deleteButton)
    const confirmButton = screen.getByText('Delete')
    fireEvent.click(confirmButton)
    expect(defaultProps.onListDelete).toHaveBeenCalledWith('list-1')
  })

  it('allows adding a card', () => {
    render(
      <Wrapper>
        <ListColumn {...defaultProps} />
      </Wrapper>
    )
    const addButton = screen.getByText('+ Add a card')
    fireEvent.click(addButton)
    const input = screen.getByPlaceholderText('Enter card title...')
    expect(input).toBeInTheDocument()
  })

  it('calls onAddCard when card title is entered', () => {
    render(
      <Wrapper>
        <ListColumn {...defaultProps} />
      </Wrapper>
    )
    const addButton = screen.getByText('+ Add a card')
    fireEvent.click(addButton)
    const input = screen.getByPlaceholderText('Enter card title...')
    fireEvent.change(input, { target: { value: 'New Card' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(defaultProps.onAddCard).toHaveBeenCalledWith('list-1', { title: 'New Card' })
  })

  it('allows editing list title', () => {
    render(
      <Wrapper>
        <ListColumn {...defaultProps} />
      </Wrapper>
    )
    const title = screen.getByText('Test List')
    fireEvent.click(title)
    const input = screen.getByDisplayValue('Test List')
    expect(input).toBeInTheDocument()
  })
})
