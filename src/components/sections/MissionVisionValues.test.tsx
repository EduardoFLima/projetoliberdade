import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import type { Block } from '../../content/types'
import { MissionVisionValues } from './MissionVisionValues'

const body: Block[] = [
  { type: 'heading', text: 'Missão' },
  { type: 'paragraph', text: 'Oferecer oportunidade.' },
  { type: 'heading', text: 'Visão' },
  { type: 'paragraph', text: 'Ser reconhecido.' },
  { type: 'heading', text: 'Valores' },
  { type: 'list', items: ['Comprometimento', 'Ética'] },
]

describe('MissionVisionValues', () => {
  it('renders three cards from the section body', () => {
    render(
      <MissionVisionValues heading="Missão, Visão e Valores" body={body} />,
    )
    expect(
      screen.getByRole('heading', { level: 3, name: 'Missão' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Visão' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Valores' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Oferecer oportunidade.')).toBeInTheDocument()
  })

  it('renders the Valores block as a list', () => {
    render(<MissionVisionValues heading="MVV" body={body} />)
    const list = screen.getByRole('list')
    expect(within(list).getByText('Comprometimento')).toBeInTheDocument()
    expect(within(list).getByText('Ética')).toBeInTheDocument()
  })

  it('does not justify card paragraphs by default', () => {
    render(<MissionVisionValues heading="MVV" body={body} />)
    expect(screen.getByText('Oferecer oportunidade.')).not.toHaveClass(
      'text-justify',
    )
  })

  it('justifies card paragraphs when justify is set', () => {
    render(<MissionVisionValues heading="MVV" body={body} justify />)
    expect(screen.getByText('Oferecer oportunidade.')).toHaveClass(
      'text-justify',
    )
  })
})
