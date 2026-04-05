import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/utils/renderWithProviders'
import ProjectShowcase from '../ProjectShowcase'
import type { ProjectSummary } from '../../../lib/types'

const makeProject = (overrides: Partial<ProjectSummary> = {}): ProjectSummary => ({
  id: 'proj-1',
  title: 'Test Project',
  slug: 'test-project',
  description: 'A detailed project description that is long enough',
  displayOrder: 0,
  techStacks: [{ id: 'ts-1', name: 'React', category: 'Frontend', displayOrder: 0 }],
  heroScreenshotUrl: undefined,
  ...overrides,
})

const twoProjects: ProjectSummary[] = [
  makeProject({ id: 'proj-1', title: 'Alpha Project', slug: 'alpha-project' }),
  makeProject({ id: 'proj-2', title: 'Beta Project', slug: 'beta-project' }),
]

describe('ProjectShowcase', () => {
  // AC3.5: Shows loading spinner while loading
  describe('loading state', () => {
    it('renders a loading spinner when loading is true', () => {
      renderWithProviders(<ProjectShowcase projects={undefined} loading={true} />)
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })

    // NFR-A3: Spinner has role="status" and aria-label="Loading"
    it('spinner has correct ARIA attributes', () => {
      renderWithProviders(<ProjectShowcase projects={undefined} loading={true} />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveAttribute('aria-label', 'Loading')
    })

    // AC3.8: Section heading is still present during loading
    it('renders "Featured Project" heading during loading', () => {
      renderWithProviders(<ProjectShowcase projects={undefined} loading={true} />)
      expect(screen.getByText('Featured Project')).toBeInTheDocument()
    })

    it('does not render a "More" button while loading', () => {
      renderWithProviders(<ProjectShowcase projects={undefined} loading={true} />)
      expect(screen.queryByText('More')).not.toBeInTheDocument()
    })
  })

  // AC3.6: Renders nothing when projects list is empty
  describe('empty state', () => {
    it('renders nothing when projects array is empty', () => {
      const { container } = renderWithProviders(
        <ProjectShowcase projects={[]} loading={false} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('renders nothing when projects is undefined and not loading', () => {
      const { container } = renderWithProviders(
        <ProjectShowcase projects={undefined} loading={false} />
      )
      expect(container.firstChild).toBeNull()
    })
  })

  // AC3.2 + AC3.8: Renders ProjectCard and heading when data is present
  describe('with projects data', () => {
    it('renders the "Featured Project" section heading', () => {
      renderWithProviders(
        <ProjectShowcase projects={[makeProject()]} loading={false} />
      )
      expect(screen.getByText('Featured Project')).toBeInTheDocument()
    })

    it('renders the project title in a ProjectCard', () => {
      renderWithProviders(
        <ProjectShowcase projects={[makeProject()]} loading={false} />
      )
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    it('renders the project description in the card', () => {
      renderWithProviders(
        <ProjectShowcase projects={[makeProject()]} loading={false} />
      )
      expect(
        screen.getByText('A detailed project description that is long enough')
      ).toBeInTheDocument()
    })

    // AC3.4: "More" button label is exactly "More"
    it('renders a button with text exactly "More"', () => {
      renderWithProviders(
        <ProjectShowcase projects={[makeProject()]} loading={false} />
      )
      const moreBtn = screen.getByText('More')
      expect(moreBtn).toBeInTheDocument()
    })

    // AC3.3: "More" button opens /projects/{slug} in a new tab
    it('"More" link has href pointing to /projects/{slug}', () => {
      renderWithProviders(
        <ProjectShowcase projects={[makeProject({ slug: 'test-project' })]} loading={false} />
      )
      const moreLink = screen.getByText('More').closest('a')
      expect(moreLink).not.toBeNull()
      expect(moreLink).toHaveAttribute('href', '/projects/test-project')
    })

    it('"More" link has target="_blank"', () => {
      renderWithProviders(
        <ProjectShowcase projects={[makeProject()]} loading={false} />
      )
      const moreLink = screen.getByText('More').closest('a')
      expect(moreLink).toHaveAttribute('target', '_blank')
    })

    // NFR-S1: rel="noopener noreferrer" for security
    it('"More" link has rel="noopener noreferrer"', () => {
      renderWithProviders(
        <ProjectShowcase projects={[makeProject()]} loading={false} />
      )
      const moreLink = screen.getByText('More').closest('a')
      expect(moreLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    // NFR-A2: "More" button has accessible aria-label
    it('"More" link has aria-label describing the project', () => {
      renderWithProviders(
        <ProjectShowcase
          projects={[makeProject({ title: 'Test Project' })]}
          loading={false}
        />
      )
      const moreLink = screen.getByText('More').closest('a')
      expect(moreLink).toHaveAttribute('aria-label', 'View Test Project in new tab')
    })

    // AC3.7: Single project is always shown
    it('renders the project when only one project exists', () => {
      renderWithProviders(
        <ProjectShowcase
          projects={[makeProject({ title: 'Only Project', slug: 'only-project' })]}
          loading={false}
        />
      )
      expect(screen.getByText('Only Project')).toBeInTheDocument()
      const moreLink = screen.getByText('More').closest('a')
      expect(moreLink).toHaveAttribute('href', '/projects/only-project')
    })

    // AC3.9: ProjectCard has its own click aria-label (confirming card is rendered as-is)
    it('ProjectCard renders with aria-label="View {title}"', () => {
      renderWithProviders(
        <ProjectShowcase
          projects={[makeProject({ title: 'Test Project' })]}
          loading={false}
        />
      )
      expect(screen.getByRole('button', { name: /view test project/i })).toBeInTheDocument()
    })
  })

  // AC3.1: Random selection — with multiple projects, selected project is one of them
  describe('random project selection', () => {
    beforeEach(() => {
      // Fix Math.random to return 0 so we always pick index 0
      vi.spyOn(Math, 'random').mockReturnValue(0)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('selects the first project when Math.random() returns 0', () => {
      renderWithProviders(
        <ProjectShowcase projects={twoProjects} loading={false} />
      )
      expect(screen.getByText('Alpha Project')).toBeInTheDocument()
    })

    it('selects the second project when Math.random() returns ~0.99', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99)
      renderWithProviders(
        <ProjectShowcase projects={twoProjects} loading={false} />
      )
      expect(screen.getByText('Beta Project')).toBeInTheDocument()
    })

    it('displayed project slug is used in "More" href', () => {
      // Math.random = 0 → picks index 0 → alpha-project
      renderWithProviders(
        <ProjectShowcase projects={twoProjects} loading={false} />
      )
      const moreLink = screen.getByText('More').closest('a')
      expect(moreLink).toHaveAttribute('href', '/projects/alpha-project')
    })
  })
})
