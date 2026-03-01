import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TechStackBadge from '../TechStackBadge'
import type { TechStackItem } from '../../../../lib/types'

const mockItem: TechStackItem = {
  id: 'ts-1',
  name: 'React',
  category: 'Frontend',
  displayOrder: 0,
}

describe('TechStackBadge', () => {
  it('renders the item name', () => {
    render(<TechStackBadge item={mockItem} />)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('renders a different item name', () => {
    const item: TechStackItem = { ...mockItem, name: 'TypeScript', id: 'ts-2' }
    render(<TechStackBadge item={item} />)
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })
})
