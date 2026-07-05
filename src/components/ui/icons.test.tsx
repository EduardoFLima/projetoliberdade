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
