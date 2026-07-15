import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithSiteLayout } from '../../test/render'
import { HistoriaPage } from './HistoriaPage'

function renderHistoria() {
  return renderWithSiteLayout([{ path: 'historia', Component: HistoriaPage }], {
    route: '/historia',
  })
}

describe('HistoriaPage', () => {
  it('renders the page hero, narrative and MVV from content', async () => {
    renderHistoria()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Nossa História' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Missão, Visão e Valores',
      }),
    ).toBeInTheDocument()
  })

  it('does not render a redundant "História" narrative heading', async () => {
    renderHistoria()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Nossa História' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.queryByRole('heading', { level: 2, name: 'História' }),
    ).not.toBeInTheDocument()
  })
})
