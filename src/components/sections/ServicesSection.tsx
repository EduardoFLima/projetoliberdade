import { useLayoutEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { cn } from '../../lib/cn'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { SectionHeading } from './SectionHeading'
import { ArrowForwardIcon } from '../ui/icons'
import { ServiceIcon } from '../ui/ServiceIcon'

export interface ServiceCardData {
  slug: string
  title: string
  excerpt: string
  to: string
  icon: string
}

interface ServicesSectionProps {
  heading: string
  intro?: string
  services: ServiceCardData[]
  tone?: 'surface' | 'muted'
  headingLevel?: 'h1' | 'h2'
  activeSlug?: string
}

interface ServiceCardProps extends ServiceCardData {
  index: number
  isActive?: boolean
}

function ServiceCard({
  icon,
  index,
  title,
  excerpt,
  to,
  isActive = false,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLElement>(null)
  const excerptRef = useRef<HTMLParagraphElement>(null)
  const [overflowing, setOverflowing] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isServicesPage = location.pathname.startsWith('/servicos')
  const showVerMais = isServicesPage ? overflowing && !isActive : true

  useLayoutEffect(() => {
    const el = excerptRef.current
    if (!el) return
    setOverflowing(el.scrollHeight > el.clientHeight + 1)
  }, [excerpt])

  useLayoutEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isActive])

  function handleCardClick(event: MouseEvent<HTMLElement>) {
    if (!isServicesPage || isActive) return
    // Let the inner "Ver mais" Link handle its own click.
    if ((event.target as HTMLElement).closest('a')) return
    navigate(to, { preventScrollReset: true })
  }

  return (
    <article
      ref={cardRef}
      onClick={handleCardClick}
      className={cn(
        'flex h-full flex-col rounded-xl border p-6 transition-all duration-300 hover:shadow-level2',
        isActive
          ? 'border-cta bg-cta/5 ring-2 ring-cta/20'
          : 'border-outline-variant/30 bg-surface',
        isServicesPage && !isActive && 'cursor-pointer',
      )}
    >
      <ServiceIcon icon={icon} index={index} className="mb-4" />
      <h3 className="mb-3 font-display text-headline-sm text-on-surface">
        {title}
      </h3>
      <p
        ref={excerptRef}
        className={cn(
          'mb-6 flex-grow font-sans text-body-md text-on-surface-variant text-justify',
          isActive ? undefined : 'line-clamp-10',
        )}
      >
        {excerpt}
      </p>
      {showVerMais ? (
        <Link
          to={to}
          preventScrollReset={isServicesPage}
          className="mt-auto inline-flex items-center gap-1 rounded-sm text-label-md text-link transition-colors hover:text-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta cursor-pointer"
        >
          Ver mais <ArrowForwardIcon className="h-4 w-4" />
        </Link>
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
  activeSlug,
}: ServicesSectionProps) {
  return (
    <Section tone={tone}>
      <Container>
        <SectionHeading title={heading} intro={intro} level={headingLevel} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard
              key={service.slug}
              icon={service.icon}
              index={index}
              slug={service.slug}
              title={service.title}
              excerpt={service.excerpt}
              to={service.to}
              isActive={service.slug === activeSlug}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
