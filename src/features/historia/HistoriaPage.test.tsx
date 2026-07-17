import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithSiteLayout } from '../../test/render'
import { contentRepository } from '../../content/content'
import { HistoriaPage, meta } from './HistoriaPage'

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

describe('HistoriaPage meta', () => {
  it('derives the title from the page content', async () => {
    const content = await contentRepository.getContent()
    const tags = meta({
      matches: [undefined, { loaderData: content }],
      params: {},
    } as unknown as Parameters<typeof meta>[0])
    expect(tags).toContainEqual({ title: 'História — Projeto Liberdade' })
  })
})
