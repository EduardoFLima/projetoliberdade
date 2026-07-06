import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import {
  ArrowForwardIcon,
  ChatIcon,
  CheckCircleIcon,
  FavoriteIcon,
  FlagIcon,
  MailIcon,
  MapIcon,
  MapPinIcon,
  MenuIcon,
  ShareIcon,
  VisibilityIcon,
  ServiceIcon,
} from './icons'

describe('icons', () => {
  it('render aria-hidden svgs and forward className', () => {
    const icons = [
      FlagIcon,
      VisibilityIcon,
      FavoriteIcon,
      ArrowForwardIcon,
      ChatIcon,
      MenuIcon,
      CheckCircleIcon,
      MailIcon,
      ShareIcon,
      MapPinIcon,
      MapIcon,
    ]
    for (const Icon of icons) {
      const { container, unmount } = render(<Icon className="h-4 w-4" />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(svg?.getAttribute('class')).toContain('h-4 w-4')
      unmount()
    }
  })
})

describe('ServiceIcon', () => {
  it('renders the matching icon for a known key', () => {
    const { container } = render(<ServiceIcon name="paw" className="h-6 w-6" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('data-icon', 'paw')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg?.getAttribute('class')).toContain('h-6 w-6')
  })

  it.each([
    ['horse-therapy'],
    ['riding-helmet'],
    ['horseshoe'],
    ['adapted-riding'],
    ['pet-terapia-typo-none'],
  ])('resolves %s (unknown falls back to default)', (name) => {
    const { container } = render(<ServiceIcon name={name} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('falls back to the default icon for an unknown or missing key', () => {
    const { container: unknown } = render(<ServiceIcon name="does-not-exist" />)
    expect(unknown.querySelector('svg')).toHaveAttribute('data-icon', 'default')

    const { container: missing } = render(<ServiceIcon />)
    expect(missing.querySelector('svg')).toHaveAttribute('data-icon', 'default')
  })
})
