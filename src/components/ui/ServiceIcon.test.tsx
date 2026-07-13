import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { ServiceIcon } from './ServiceIcon'

describe('ServiceIcon', () => {
  it('renders an inline svg for a Material glyph key', () => {
    const { container } = render(<ServiceIcon icon="pets" index={0} />)
    expect(
      container.querySelector('[data-icon="pets"] svg'),
    ).toBeInTheDocument()
  })

  it('renders a masked span for an illustration key', () => {
    const { container } = render(
      <ServiceIcon icon="equine-therapy" index={0} />,
    )
    const glyph = container.querySelector<HTMLElement>(
      '[data-icon="equine-therapy"] > span',
    )
    expect(glyph).not.toBeNull()
    expect(glyph?.style.maskImage).toContain('/icons/equine-therapy.mask.png')
  })

  it('alternates tone by index parity', () => {
    const { container: even } = render(<ServiceIcon icon="pets" index={0} />)
    const { container: odd } = render(<ServiceIcon icon="pets" index={1} />)
    expect(even.querySelector('[data-tone="green"]')).toBeInTheDocument()
    expect(odd.querySelector('[data-tone="purple"]')).toBeInTheDocument()
  })

  it('renders nothing for an unknown key', () => {
    const { container } = render(<ServiceIcon icon="nope" index={0} />)
    expect(container).toBeEmptyDOMElement()
  })
})
