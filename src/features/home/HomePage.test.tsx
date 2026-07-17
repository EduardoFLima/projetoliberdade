import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithSiteLayout } from '../../test/render'
import { contentRepository } from '../../content/content'
import { HomePage, meta } from './HomePage'

function renderHome() {
  return renderWithSiteLayout([{ index: true, Component: HomePage }])
}

describe('HomePage', () => {
  it('composes hero and all sections from content', async () => {
    renderHome()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Reabilitação e Equoterapia',
        }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'História' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Missão, Visão e Valores',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Nossos Serviços' }),
    ).toBeInTheDocument()
  })

  it('renders the featured services in order', async () => {
    renderHome()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 3, name: 'Equoterapia' }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('heading', { level: 3, name: 'Equitação Lúdica' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Equitação Adaptada' }),
    ).toBeInTheDocument()
  })
})

describe('HomePage meta', () => {
  it('derives title and description from content', async () => {
    const content = await contentRepository.getContent()
    const tags = meta({
      matches: [undefined, { loaderData: content }],
      params: {},
    } as unknown as Parameters<typeof meta>[0])
    expect(tags).toContainEqual({
      title: 'Projeto Liberdade — Reabilitação e Equoterapia',
    })
    expect(tags).toContainEqual({
      name: 'description',
      content:
        'Promovendo qualidade de vida e desenvolvimento biopsicossocial através da relação com o cavalo.',
    })
  })
})
