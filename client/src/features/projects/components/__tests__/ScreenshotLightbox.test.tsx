import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ScreenshotLightbox from '../ScreenshotLightbox'
import type { ProjectScreenshot } from '../../../../lib/types'

const screenshot: ProjectScreenshot = {
  id: 'sc-1',
  url: 'https://example.com/image.png',
  publicId: 'image-public-id',
  caption: 'A beautiful screenshot',
  displayOrder: 0,
}

const screenshotNoCaption: ProjectScreenshot = {
  id: 'sc-2',
  url: 'https://example.com/image2.png',
  publicId: 'image-public-id-2',
  displayOrder: 1,
}

describe('ScreenshotLightbox', () => {
  it('renders with role="dialog"', () => {
    const onClose = vi.fn()
    render(
      <ScreenshotLightbox
        screenshot={screenshot}
        projectTitle="My Project"
        onClose={onClose}
      />
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows the screenshot image', () => {
    const onClose = vi.fn()
    render(
      <ScreenshotLightbox
        screenshot={screenshot}
        projectTitle="My Project"
        onClose={onClose}
      />
    )
    const images = screen.getAllByRole('img')
    const img = images[0]
    expect(img).toHaveAttribute('src', 'https://example.com/image.png')
  })

  it('shows the caption when provided', () => {
    const onClose = vi.fn()
    render(
      <ScreenshotLightbox
        screenshot={screenshot}
        projectTitle="My Project"
        onClose={onClose}
      />
    )
    expect(screen.getByText('A beautiful screenshot')).toBeInTheDocument()
  })

  it('does not show a caption paragraph when caption is absent', () => {
    const onClose = vi.fn()
    render(
      <ScreenshotLightbox
        screenshot={screenshotNoCaption}
        projectTitle="My Project"
        onClose={onClose}
      />
    )
    // The caption paragraph should not be rendered
    expect(screen.queryByText('A beautiful screenshot')).not.toBeInTheDocument()
  })

  it('calls onClose when the Escape key is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <ScreenshotLightbox
        screenshot={screenshot}
        projectTitle="My Project"
        onClose={onClose}
      />
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <ScreenshotLightbox
        screenshot={screenshot}
        projectTitle="My Project"
        onClose={onClose}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Close lightbox' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the backdrop is clicked directly', async () => {
    const onClose = vi.fn()
    render(
      <ScreenshotLightbox
        screenshot={screenshot}
        projectTitle="My Project"
        onClose={onClose}
      />
    )
    // Click the dialog element itself (the backdrop) directly
    const dialog = screen.getByRole('dialog')
    dialog.click()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does NOT call onClose when the image is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <ScreenshotLightbox
        screenshot={screenshot}
        projectTitle="My Project"
        onClose={onClose}
      />
    )
    const images = screen.getAllByRole('img')
    await user.click(images[0])
    // Clicking the image should not call onClose because e.target !== e.currentTarget
    expect(onClose).not.toHaveBeenCalled()
  })
})
