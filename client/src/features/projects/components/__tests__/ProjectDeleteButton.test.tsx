import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import ProjectDeleteButton from '../ProjectDeleteButton'

// Mock useDeleteProject so that we don't need a real QueryClient or API calls.
// The mutateAsync function is a spy so we can verify it gets called.
const mockMutateAsync = vi.fn()

vi.mock('../../../../lib/hooks/useProjects', () => ({
  useDeleteProject: () => ({
    deleteProject: {
      mutateAsync: mockMutateAsync,
      isPending: false,
    },
  }),
}))

function renderButton(projectId = 'proj-1') {
  return render(
    <MemoryRouter>
      <ProjectDeleteButton projectId={projectId} />
    </MemoryRouter>
  )
}

describe('ProjectDeleteButton', () => {
  beforeEach(() => {
    mockMutateAsync.mockReset()
  })

  it('shows the "Delete Project" button initially', () => {
    renderButton()
    expect(
      screen.getByRole('button', { name: 'Delete Project' })
    ).toBeInTheDocument()
  })

  it('shows confirmation UI after clicking "Delete Project"', async () => {
    const user = userEvent.setup()
    renderButton()

    await user.click(screen.getByRole('button', { name: 'Delete Project' }))

    expect(
      screen.getByText('Are you sure? This cannot be undone.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('restores the "Delete Project" button when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderButton()

    await user.click(screen.getByRole('button', { name: 'Delete Project' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(
      screen.getByRole('button', { name: 'Delete Project' })
    ).toBeInTheDocument()
    expect(screen.queryByText('Are you sure? This cannot be undone.')).not.toBeInTheDocument()
  })

  it('calls deleteProject.mutateAsync with the project id when Confirm is clicked', async () => {
    const user = userEvent.setup()
    mockMutateAsync.mockResolvedValue(undefined)
    renderButton('proj-42')

    await user.click(screen.getByRole('button', { name: 'Delete Project' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(mockMutateAsync).toHaveBeenCalledWith('proj-42')
  })
})
