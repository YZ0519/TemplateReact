import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FeatureList from '../FeatureList'
import type { ProjectFeature } from '../../../../lib/types'

describe('FeatureList', () => {
  it('returns null when the features array is empty', () => {
    const { container } = render(<FeatureList features={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders all features when multiple items are provided', () => {
    const features: ProjectFeature[] = [
      { id: 'f-1', description: 'First feature', displayOrder: 0 },
      { id: 'f-2', description: 'Second feature', displayOrder: 1 },
    ]

    render(<FeatureList features={features} />)

    expect(screen.getByText('First feature')).toBeInTheDocument()
    expect(screen.getByText('Second feature')).toBeInTheDocument()
  })

  it('sorts features by displayOrder ascending', () => {
    // Provide features in reverse order; expect them to render sorted
    const features: ProjectFeature[] = [
      { id: 'f-3', description: 'Third feature', displayOrder: 2 },
      { id: 'f-1', description: 'First feature', displayOrder: 0 },
      { id: 'f-2', description: 'Second feature', displayOrder: 1 },
    ]

    render(<FeatureList features={features} />)

    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('First feature')
    expect(items[1]).toHaveTextContent('Second feature')
    expect(items[2]).toHaveTextContent('Third feature')
  })
})
