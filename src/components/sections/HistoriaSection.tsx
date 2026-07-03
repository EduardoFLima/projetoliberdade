import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from './SectionHeading'

interface HistoriaSectionProps {
  heading: string
  paragraphs: string[]
  image?: { src: string; alt: string }
  cta?: { label: string; to: string }
  tone?: 'surface' | 'muted'
}

export function HistoriaSection({
  heading,
  paragraphs,
  image,
  cta,
  tone = 'surface',
}: HistoriaSectionProps) {
  return (
    <Section tone={tone}>
      <Container>
        <SectionHeading title={heading} />
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            {paragraphs.map((text) => (
              <p
                key={text}
                className="font-sans text-body-md text-on-surface-variant"
              >
                {text}
              </p>
            ))}
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
