import { describe, expect, it, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import type { NavItem } from '../content/types'
import { renderWithRouter } from '../test/render'
import { MobileDrawer } from './MobileDrawer'

const items: NavItem[] = [
  { slug: 'home', label: 'Home', order: 0 },
  {
    slug: 'momentos',
    label: 'Momentos',
    order: 3,
    submenu: [
      { slug: 'videos', label: 'Vídeos', order: 1 },
      { slug: 'fotos', label: 'Fotos', order: 2 },
    ],
  },
  { slug: 'contato', label: 'Contato', order: 4 },
]

describe('MobileDrawer', () => {
  it('is hidden from the a11y tree when closed', () => {
    renderWithRouter(<MobileDrawer items={items} open={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders top-level and submenu links when open', () => {
    renderWithRouter(<MobileDrawer items={items} open onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Contato' })).toHaveAttribute(
      'href',
      '/contato',
    )
    expect(screen.getByRole('link', { name: 'Fotos' })).toHaveAttribute(
      'href',
      '/momentos/fotos',
    )
    expect(screen.getByRole('link', { name: 'Vídeos' })).toHaveAttribute(
      'href',
      '/momentos/videos',
    )
  })

  it('calls onClose on Escape, scrim click, close button, and link click', () => {
    const onClose = vi.fn()
    renderWithRouter(<MobileDrawer items={items} open onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId('drawer-scrim'))
    expect(onClose).toHaveBeenCalledTimes(2)

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledTimes(3)

    fireEvent.click(screen.getByRole('link', { name: 'Home' }))
    expect(onClose).toHaveBeenCalledTimes(4)
  })
})
