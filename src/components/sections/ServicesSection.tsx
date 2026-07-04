import { Link } from 'react-router'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from './SectionHeading'
import { ArrowForwardIcon } from '../ui/icons'

export interface ServiceCardData {
  slug: string
  title: string
  excerpt: string
  to: string
}

interface ServicesSectionProps {
  heading: string
  intro?: string
  services: ServiceCardData[]
  tone?: 'surface' | 'muted'
  headingLevel?: 'h1' | 'h2'
}

export function ServicesSection({
  heading,
  intro,
  services,
  tone = 'surface',
  headingLevel = 'h2',
}: ServicesSectionProps) {
  return (
    <Section tone={tone}>
      <Container>
        <SectionHeading title={heading} intro={intro} level={headingLevel} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.slug}
              className="flex h-full flex-col rounded-xl border border-outline-variant/30 bg-surface p-6 transition-shadow hover:shadow-level2"
            >
              <h3 className="mb-3 font-display text-headline-sm text-on-surface">
                {service.title}
              </h3>
              <p className="mb-6 flex-grow font-sans text-body-md text-on-surface-variant line-clamp-5">
                {service.excerpt}
              </p>
              <Link
                to={service.to}
                className="mt-auto inline-flex items-center gap-1 rounded-sm text-label-md text-link transition-colors hover:text-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              >
                Ver mais <ArrowForwardIcon className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
