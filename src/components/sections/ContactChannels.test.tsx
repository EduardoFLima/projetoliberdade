import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContactChannels } from './ContactChannels'

const props = {
  heading: 'Fale Conosco',
  socialHeading: 'Redes Sociais',
  whatsapps: [
    { name: 'Karina', number: '(11) 94191-7707', tel: '+5511941917707' },
  ],
  email: 'contato@projetoliberdade.com.br',
  social: [{ network: 'instagram', url: 'https://instagram.com/x' }],
}

describe('ContactChannels', () => {
  it('renders whatsapp tel links, an email mailto link and social buttons', () => {
    render(<ContactChannels {...props} />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Fale Conosco' }),
    ).toBeInTheDocument()

    const wa = screen.getByRole('link', { name: /Karina/ })
    expect(wa).toHaveAttribute('href', 'tel:+5511941917707')

    const mail = screen.getByRole('link', {
      name: 'contato@projetoliberdade.com.br',
    })
    expect(mail).toHaveAttribute(
      'href',
      'mailto:contato@projetoliberdade.com.br',
    )

    expect(
      screen.getByRole('heading', { level: 2, name: 'Redes Sociais' }),
    ).toBeInTheDocument()
    const insta = screen.getByRole('link', { name: 'Instagram' })
    expect(insta.className).toContain('rounded-full')
  })
})
