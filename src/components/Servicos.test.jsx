import { render, screen } from '@testing-library/react'
import Servicos from './Servicos'

const data = {
  menuText: 'Serviços',
  order: 5,
  submenu: true,
  servicos: {
    menuText: 'Serviços',
    order: 0,
    p1: { txts: { txt: 'O Projeto Liberdade conta com profissionais das áreas da saúde e educação.' } },
    titulo: 'Serviços',
  },
  equoterapia: {
    menuText: 'Equoterapia',
    order: 1,
    p1: { txts: { txt: 'A Equoterapia é um método terapêutico.' } },
    p2: { txts: { txt: 'Emprega o cavalo como agente promotor de ganhos.' } },
    titulo: 'Equoterapia',
  },
  natacao: {
    menuText: 'Natação',
    order: 2,
    p1: { txts: { txt: 'A natação é uma atividade aquática.' } },
    titulo: 'Natação',
  },
}

test('renders the section heading', () => {
  render(<Servicos data={data} />)
  expect(screen.getByRole('heading', { level: 2, name: 'Nossos Serviços' })).toBeInTheDocument()
})

test('renders the intro paragraph as lead text, not as a card', () => {
  render(<Servicos data={data} />)
  // intro text is present
  expect(screen.getByText(/profissionais das áreas da saúde e educação/i)).toBeInTheDocument()
  // but "Serviços" is NOT one of the service card headings (h3)
  expect(screen.queryByRole('heading', { level: 3, name: 'Serviços' })).toBeNull()
})

test('renders one card per real service and no blank cards', () => {
  render(<Servicos data={data} />)
  const cardHeadings = screen.getAllByRole('heading', { level: 3 })
  expect(cardHeadings.map((h) => h.textContent)).toEqual(['Equoterapia', 'Natação'])
})

test('sorts cards by order ascending', () => {
  const reordered = {
    ...data,
    equoterapia: { ...data.equoterapia, order: 9 },
    natacao: { ...data.natacao, order: 1 },
  }
  render(<Servicos data={reordered} />)
  const cardHeadings = screen.getAllByRole('heading', { level: 3 })
  expect(cardHeadings.map((h) => h.textContent)).toEqual(['Natação', 'Equoterapia'])
})

test('renders nothing when data is null', () => {
  const { container } = render(<Servicos data={null} />)
  expect(container.firstChild).toBeNull()
})

test('renders without intro when servicos entry is absent', () => {
  const { servicos, ...withoutIntro } = data
  render(<Servicos data={withoutIntro} />)
  expect(screen.getByRole('heading', { level: 2, name: 'Nossos Serviços' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 3, name: 'Equoterapia' })).toBeInTheDocument()
})
