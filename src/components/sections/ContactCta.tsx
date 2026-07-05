import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { ContactButton } from '../ui/ContactButton'

interface ContactCtaProps {
  heading: string
  body?: string
  tone?: 'surface' | 'muted'
}

export function ContactCta({
  heading,
  body,
  tone = 'surface',
}: ContactCtaProps) {
  return (
    <Section tone={tone}>
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="font-display text-headline-md text-secondary">
          {heading}
        </h2>
        {body ? (
          <p className="max-w-2xl font-sans text-body-lg text-on-surface-variant">
            {body}
          </p>
        ) : null}
        <ContactButton />
      </Container>
    </Section>
  )
}
