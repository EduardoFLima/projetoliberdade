import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithSiteLayout } from '../../test/render'
import { MomentosPage } from './MomentosPage'

function renderAt(path: string) {
  return renderWithSiteLayout(
    [
      { path: 'momentos', Component: MomentosPage },
      { path: 'momentos/fotos', Component: MomentosPage },
    ],
    { route: path },
  )
}

describe('MomentosPage', () => {
  it('renders the video grid at /momentos', async () => {
    renderAt('/momentos')
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Nossos Momentos' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getAllByRole('button', { name: /^Assistir:/ }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.queryByRole('button', { name: /^Ampliar foto:/ }),
    ).not.toBeInTheDocument()
  })

  it('renders the photo grid at /momentos/fotos', async () => {
    renderAt('/momentos/fotos')
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Nossos Momentos' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getAllByRole('button', { name: /^Ampliar foto:/ }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.queryByRole('button', { name: /^Assistir:/ }),
    ).not.toBeInTheDocument()
  })
})
