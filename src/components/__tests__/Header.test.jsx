import { render, screen } from '@testing-library/react'
import Header from '../Header'
import { BoardProvider } from '../../context/BoardProvider'

describe('Header', () => {
  it('renders Kanban Board title', () => {
    render(
      <BoardProvider>
        <Header />
      </BoardProvider>
    )
    expect(screen.getByText('Kanban Board')).toBeInTheDocument()
  })
})
