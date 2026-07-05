import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
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

function ServiceCard({
  title,
  excerpt,
}: Pick<ServiceCardData, 'title' | 'excerpt'>) {
  const excerptRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)

  useLayoutEffect(() => {
    const el = excerptRef.current
    if (!el) return
    setOverflowing(el.scrollHeight > el.clientHeight + 1)
  }, [excerpt])

  return (
    <article className="flex h-full flex-col rounded-xl border border-outline-variant/30 bg-surface p-6 transition-shadow hover:shadow-level2">
      <h3 className="mb-3 font-display text-headline-sm text-on-surface">
        {title}
      </h3>
      <p
        ref={excerptRef}
        className={cn(
          'mb-6 flex-grow font-sans text-body-md text-on-surface-variant text-justify',
          expanded ? undefined : 'line-clamp-10',
        )}
      >
        {excerpt}
      </p>
      {overflowing && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-auto inline-flex items-center gap-1 rounded-sm text-label-md text-link transition-colors hover:text-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        >
          Ver mais <ArrowForwardIcon className="h-4 w-4" />
        </button>
      ) : null}
    </article>
  )
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
            <ServiceCard
              key={service.slug}
              title={service.title}
              excerpt={service.excerpt}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
