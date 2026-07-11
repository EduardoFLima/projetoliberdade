import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from './SectionHeading'
import { Quote } from '../blocks/Quote'
import { cn } from '../../lib/cn'

interface HistoriaSectionProps {
  heading?: string
  paragraphs: string[]
  image?: { src: string; alt: string }
  cta?: { label: string; to: string }
  quote?: { text: string; author?: string }
  tone?: 'surface' | 'muted'
  justify?: boolean
}

export function HistoriaSection({
  heading,
  paragraphs,
  image,
  cta,
  quote,
  tone = 'surface',
  justify = false,
}: HistoriaSectionProps) {
  return (
    <Section tone={tone}>
      <Container>
        {heading ? <SectionHeading title={heading} /> : null}
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            {paragraphs.map((text) => (
              <p
                key={text}
                className={cn(
                  'font-sans text-body-md text-on-surface-variant',
                  justify && 'text-justify',
                )}
              >
                {text}
              </p>
            ))}
            {quote ? (
              <Quote text={quote.text} author={quote.author} justify={justify} />
            ) : null}
            {cta ? (
              <Button to={cta.to} variant="secondary">
                {cta.label}
              </Button>
            ) : null}
          </div>
          {image ? (
            <div className="overflow-hidden rounded-xl shadow-level1">
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  )
}
