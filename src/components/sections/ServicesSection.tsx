import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from './SectionHeading'
import { ArrowForwardIcon, ServiceIcon } from '../ui/icons'

export interface ServiceCardData {
  slug: string
  title: string
  excerpt: string
  to: string
  icon?: string
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
  icon,
  index,
}: Pick<ServiceCardData, 'title' | 'excerpt' | 'icon'> & { index: number }) {
  const excerptRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)

  useLayoutEffect(() => {
    const el = excerptRef.current
    if (!el) return
    setOverflowing(el.scrollHeight > el.clientHeight + 1)
  }, [excerpt])

  const tone = index % 2 === 0 ? 'green' : 'purple'

  return (
    <article className="flex h-full flex-col rounded-xl border border-outline-variant/30 bg-surface p-6 transition-shadow hover:shadow-level2">
      <div
        data-icon-tone={tone}
        className={cn(
          'mb-4 flex h-12 w-12 items-center justify-center rounded-xl',
          tone === 'green'
            ? 'bg-primary-container/15 text-cta'
            : 'bg-secondary-container/40 text-secondary',
        )}
      >
        <ServiceIcon name={icon} className="h-6 w-6" />
      </div>
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
          {services.map((service, index) => (
            <ServiceCard
              key={service.slug}
              title={service.title}
              excerpt={service.excerpt}
              icon={service.icon}
              index={index}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
