import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TechStackList from '../TechStackList'
import type { TechStackItem } from '../../../../lib/types'

describe('TechStackList', () => {
  it('returns null when the items array is empty', () => {
    const { container } = render(<TechStackList items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders all item names when multiple items are provided', () => {
    const items: TechStackItem[] = [
      { id: 'ts-1', name: 'React', category: 'Frontend', displayOrder: 0 },
      { id: 'ts-2', name: 'TypeScript', category: 'Language', displayOrder: 1 },
      { id: 'ts-3', name: 'Tailwind CSS', category: 'Styling', displayOrder: 2 },
    ]

    render(<TechStackList items={items} />)

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument()
  })

  it('renders a single item', () => {
    const items: TechStackItem[] = [
      { id: 'ts-1', name: 'Vitest', category: 'Testing', displayOrder: 0 },
    ]

    render(<TechStackList items={items} />)

    expect(screen.getByText('Vitest')).toBeInTheDocument()
  })
})
