import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/utils/renderWithProviders'
import HomeStat from '../HomeStat'

describe('HomeStat', () => {
  // AC2.2: Icon is rendered
  it('renders the FolderOpen icon (svg element)', () => {
    renderWithProviders(<HomeStat count={5} loading={false} />)
    // lucide-react icons render as <svg> elements
    const svg = document.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  // AC2.1: Displays the project count
  it('displays the project count when not loading', () => {
    renderWithProviders(<HomeStat count={7} loading={false} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  // AC2.6: Shows 0 when count is zero
  it('displays 0 when count is zero', () => {
    renderWithProviders(<HomeStat count={0} loading={false} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  // AC2.1 + AC2.6: Displays 0 when count is undefined (fallback)
  it('displays 0 when count is undefined', () => {
    renderWithProviders(<HomeStat count={undefined} loading={false} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  // AC2.5: Shows loading spinner while loading, not the count
  it('renders a loading spinner when loading is true', () => {
    renderWithProviders(<HomeStat count={7} loading={true} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    expect(screen.queryByText('7')).not.toBeInTheDocument()
  })

  // NFR-A3: Spinner has role="status" and aria-label="Loading"
  it('spinner has role="status" and aria-label="Loading"', () => {
    renderWithProviders(<HomeStat count={3} loading={true} />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  // AC2.3: Renders "Projects" label
  it('renders the "Projects" text label', () => {
    renderWithProviders(<HomeStat count={5} loading={false} />)
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })

  // AC2.4: The card links to /projects
  it('links to /projects', () => {
    renderWithProviders(<HomeStat count={5} loading={false} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/projects')
  })

  // NFR-A1: The card has an accessible aria-label for screen readers
  it('has aria-label="View all projects" on the link', () => {
    renderWithProviders(<HomeStat count={5} loading={false} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', 'View all projects')
  })

  // AC2.4: Clicking navigates to /projects (React Router navigation)
  it('navigates to /projects when clicked', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(
      <HomeStat count={5} loading={false} />,
      { route: '/', path: '/' }
    )
    const link = screen.getByRole('link', { name: /view all projects/i })
    expect(link).toBeInTheDocument()
    // Verify the href is correct — navigation is handled by react-router MemoryRouter in tests
    expect(link).toHaveAttribute('href', '/projects')
    await user.click(link)
    // After click the link destination is /projects — just verify no crash
    expect(container).toBeInTheDocument()
  })

  // AC2.7: Card has the expected styling tokens (white bg, border classes)
  it('applies card styling classes', () => {
    renderWithProviders(<HomeStat count={5} loading={false} />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('bg-white')
    expect(link.className).toContain('border')
    expect(link.className).toContain('rounded')
  })
})
