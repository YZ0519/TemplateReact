import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ProjectCard from '../ProjectCard'
import type { ProjectSummary } from '../../../../lib/types'

const baseProject: ProjectSummary = {
  id: 'proj-1',
  title: 'My Awesome Project',
  slug: 'my-awesome-project',
  description: 'A detailed description of the project for display in the card',
  displayOrder: 0,
  techStacks: [
    { id: 'ts-1', name: 'React', category: 'Frontend', displayOrder: 0 },
    { id: 'ts-2', name: 'TypeScript', category: 'Language', displayOrder: 1 },
  ],
  heroScreenshotUrl: undefined,
}

function renderCard(project: ProjectSummary) {
  return render(
    <MemoryRouter>
      <ProjectCard project={project} />
    </MemoryRouter>
  )
}

describe('ProjectCard', () => {
  it('renders the project title', () => {
    renderCard(baseProject)
    expect(screen.getByText('My Awesome Project')).toBeInTheDocument()
  })

  it('renders the project description', () => {
    renderCard(baseProject)
    expect(
      screen.getByText(
        'A detailed description of the project for display in the card'
      )
    ).toBeInTheDocument()
  })

  it('renders all tech stack badge names', () => {
    renderCard(baseProject)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('renders the hero image when heroScreenshotUrl is provided', () => {
    const project: ProjectSummary = {
      ...baseProject,
      heroScreenshotUrl: 'https://example.com/screenshot.png',
    }
    renderCard(project)
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/screenshot.png')
    expect(img).toHaveAttribute('alt', 'My Awesome Project')
  })

  it('does not render an image when heroScreenshotUrl is null', () => {
    const project: ProjectSummary = {
      ...baseProject,
      heroScreenshotUrl: undefined,
    }
    renderCard(project)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('has the correct aria-label for accessibility', () => {
    renderCard(baseProject)
    expect(
      screen.getByRole('button', { name: 'View My Awesome Project' })
    ).toBeInTheDocument()
  })
})
