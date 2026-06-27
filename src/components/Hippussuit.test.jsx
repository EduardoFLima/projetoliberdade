import { render, screen, fireEvent } from '@testing-library/react'
import Hippussuit from './Hippussuit'

const data = {
  menuText: 'Hippussuit',
  order: 6,
  hippussuit: {
    titulo: 'Hippussuit',
    p1: {
      txts: {
        txt: 'Contexto da equoterapia e do alinhamento postural durante a montaria.',
        txt2: 'O HippusSuit é uma vestimenta dinâmica de borracha sintética com poliamida.',
        txt3: 'O HippusSuit favorece a montaria individual e ativa musculaturas isoladas.',
      },
    },
    p2: {
      txts: {
        txt: 'Nos aspectos motores, o HippusSuit promove:',
        ul: {
          li: 'Motor um',
          li2: 'Motor dois',
          li3: 'Motor três',
          li4: 'Motor quatro',
          li5: 'Motor cinco',
          li6: 'Motor seis',
          li10: 'Motor dez',
        },
      },
    },
    p3: {
      txts: {
        txt: 'Os aspectos comportamentais o HippusSuit promove:',
        ul: {
          li: 'Comportamento um',
          li2: 'Comportamento dois',
          li3: 'Comportamento três',
        },
      },
    },
    p4: {
      txts: {
        txt: 'O uso da órtese pode ser sugerido numa fase do tratamento.',
        txt2: 'Os resultados sinalizam que os recursos são sempre bem vindos.',
      },
    },
    p5: {
      txts: {
        txt: 'Desenvolvido por:',
        ul: {
          li: 'Karina Hollatz – Fisioterapeuta',
          li2: 'André Augusto Amaral Gomes – Equitador/Educador Físico',
          li3: 'Cibele Ferreira Lima – Terapeuta Ocupacional',
          li4: 'Equipe do Centro de Equoterapia e Equitação Projeto Liberdade',
        },
      },
    },
  },
}

test('renders the section heading', () => {
  render(<Hippussuit data={data} />)
  expect(screen.getByRole('heading', { level: 2, name: 'Hippussuit' })).toBeInTheDocument()
})

test('renders all three intro paragraphs including previously dropped txt2 and txt3', () => {
  render(<Hippussuit data={data} />)
  expect(screen.getByText(/Contexto da equoterapia/i)).toBeInTheDocument()
  expect(screen.getByText(/vestimenta dinâmica de borracha sintética/i)).toBeInTheDocument()
  expect(screen.getByText(/favorece a montaria individual/i)).toBeInTheDocument()
})

test('renders the motor and behavioral benefit headings', () => {
  render(<Hippussuit data={data} />)
  expect(screen.getByText(/Nos aspectos motores/i)).toBeInTheDocument()
  expect(screen.getByText(/aspectos comportamentais/i)).toBeInTheDocument()
})

test('shows all behavioral items and gives that card no toggle (5 or fewer items)', () => {
  render(<Hippussuit data={data} />)
  expect(screen.getByText('Comportamento três')).toBeInTheDocument()
  // exactly one toggle on the page — the motor card; the behavioral card has none
  expect(screen.getAllByRole('button', { name: 'Ver mais' })).toHaveLength(1)
})

test('motor card collapses long lists and orders items by numeric suffix', () => {
  render(<Hippussuit data={data} />)
  // collapsed: first five by numeric suffix (um..cinco) are shown
  expect(screen.getByText('Motor cinco')).toBeInTheDocument()
  // item 6 and item 10 are hidden while collapsed — and 'Motor dez' must NOT
  // leak into the first five (it would under a naive string sort)
  expect(screen.queryByText('Motor seis')).toBeNull()
  expect(screen.queryByText('Motor dez')).toBeNull()
  // expanding reveals the rest
  fireEvent.click(screen.getByRole('button', { name: 'Ver mais' }))
  expect(screen.getByText('Motor seis')).toBeInTheDocument()
  expect(screen.getByText('Motor dez')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Ver menos' })).toBeInTheDocument()
})

test('renders both conclusion paragraphs including previously dropped txt2', () => {
  render(<Hippussuit data={data} />)
  expect(screen.getByText(/pode ser sugerido numa fase/i)).toBeInTheDocument()
  expect(screen.getByText(/recursos são sempre bem vindos/i)).toBeInTheDocument()
})

test('renders the credits block with the heading and all four names', () => {
  render(<Hippussuit data={data} />)
  expect(screen.getByText('Desenvolvido por:')).toBeInTheDocument()
  expect(screen.getByText(/Karina Hollatz/)).toBeInTheDocument()
  expect(screen.getByText(/André Augusto Amaral Gomes/)).toBeInTheDocument()
  expect(screen.getByText(/Cibele Ferreira Lima/)).toBeInTheDocument()
  expect(screen.getByText(/Equipe do Centro de Equoterapia/)).toBeInTheDocument()
})

test('renders nothing when data is null', () => {
  const { container } = render(<Hippussuit data={null} />)
  expect(container.firstChild).toBeNull()
})
