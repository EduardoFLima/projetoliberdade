import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithSiteLayout } from '../../test/render'
import { ContatoPage } from './ContatoPage'

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
