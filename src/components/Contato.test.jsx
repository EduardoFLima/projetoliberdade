import { render, screen } from '@testing-library/react'
import Contato from './Contato'

const data = {
  titulo: 'Contato',
  telefone: {
    subtitulo: 'Telefone/Whatsapp',
    contatos: { c1: { nome: 'Karina', numero: '(11) 94191-7707' } },
  },
  email: { subtitulo: 'e-mail', endereco: 'contato@projetoliberdade.com.br' },
  social: {
    subtitulo: 'Redes sociais',
    fb: {
      url: 'http://www.facebook.com.br/projetoliberdade',
      img: { src: 'contato/facebook-512.png' },
    },
    insta: {
      url: 'https://www.instagram.com/projetoliberdadereabilitacao',
      img: { src: 'contato/instas-app-icon2.png' },
    },
  },
  enderecos: [
    {
      nome: 'Haras Liberdade - Serra',
      subtitulo: 'Unidade 1 - Serra',
      localidade: 'R. Flôr da Penha, 916',
      bairro: 'Bela Vista',
      cidade: 'Mairiporã',
      uf: 'SP',
      cep: '07612-852',
    },
  ],
}

test('does not render the contact form', () => {
  render(<Contato data={data} />)
  expect(screen.queryByRole('button', { name: /enviar mensagem/i })).toBeNull()
  expect(screen.queryByLabelText(/mensagem/i)).toBeNull()
})

test('renders facebook and instagram links from data', () => {
  render(<Contato data={data} />)
  expect(screen.getByRole('link', { name: /facebook/i })).toHaveAttribute(
    'href',
    'http://www.facebook.com.br/projetoliberdade'
  )
  expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute(
    'href',
    'https://www.instagram.com/projetoliberdadereabilitacao'
  )
})

test('renders without throwing when social data is absent', () => {
  const { social, ...withoutSocial } = data
  render(<Contato data={withoutSocial} />)
  expect(screen.queryByRole('link', { name: /facebook/i })).toBeNull()
})
