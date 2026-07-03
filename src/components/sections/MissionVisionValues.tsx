import type { ComponentType } from 'react'
import type { Block } from '../../content/types'
import { Card } from '../ui/Card'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from './SectionHeading'
import { FavoriteIcon, FlagIcon, VisibilityIcon } from '../ui/icons'

interface MissionVisionValuesProps {
  heading: string
  body: Block[]
  tone?: 'surface' | 'muted'
}

interface MvvCard {
  title: string
  blocks: Block[]
}

function toCards(body: Block[]): MvvCard[] {
  const cards: MvvCard[] = []
  for (const block of body) {
    if (block.type === 'heading') {
      cards.push({ title: block.text, blocks: [] })
    } else if (cards.length > 0) {
      cards[cards.length - 1].blocks.push(block)
    }
  }
  return cards
}

const icons: Record<string, ComponentType<{ className?: string }>> = {
  Missão: FlagIcon,
  Visão: VisibilityIcon,
  Valores: FavoriteIcon,
}

export function MissionVisionValues({
  heading,
  body,
  tone = 'muted',
}: MissionVisionValuesProps) {
  const cards = toCards(body)
  return (
    <Section tone={tone}>
      <Container>
        <SectionHeading title={heading} />
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = icons[card.title] ?? FavoriteIcon
            return (
              <Card
                key={card.title}
                className="flex flex-col items-center text-center"
              >
                <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-8 w-8 text-primary" />
                </span>
                <h3 className="mb-3 font-display text-headline-sm text-on-surface">
                  {card.title}
                </h3>
                {card.blocks.map((block) => {
                  if (block.type === 'paragraph') {
                    return (
                      <p
                        key={block.text}
                        className="font-sans text-body-md text-on-surface-variant"
                      >
                        {block.text}
                      </p>
                    )
                  }
                  if (block.type === 'list') {
                    return (
                      <ul
                        key={block.items[0] ?? 'list'}
                        className="mt-2 list-disc space-y-1 pl-5 text-left font-sans text-body-md text-on-surface-variant"
                      >
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )
                  }
                  return null
                })}
              </Card>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
