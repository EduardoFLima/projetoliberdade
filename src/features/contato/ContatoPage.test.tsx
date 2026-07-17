import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithSiteLayout } from '../../test/render'
import { contentRepository } from '../../content/content'
import { ContatoPage, meta } from './ContatoPage'

function renderContato() {
  return renderWithSiteLayout([{ path: 'contato', Component: ContatoPage }], {
    route: '/contato',
  })
}

describe('ContatoPage', () => {
  it('renders hero, channels and units from content', async () => {
    renderContato()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Entre em Contato' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'Fale Conosco' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nossas Unidades' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Unidade 1 - Serra' }),
    ).toBeInTheDocument()
  })
})

describe('ContatoPage meta', () => {
  it('derives the title from the page content', async () => {
    const content = await contentRepository.getContent()
    const tags = meta({
      matches: [undefined, { loaderData: content }],
      params: {},
    } as unknown as Parameters<typeof meta>[0])
    expect(tags).toContainEqual({ title: 'Contato — Projeto Liberdade' })
  })
})
