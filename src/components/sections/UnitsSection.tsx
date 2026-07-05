import type { UnitView } from '../../features/contato/contatoSelectors'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { MapIcon, MapPinIcon } from '../ui/icons'
import { MapEmbed } from '../MapEmbed'

interface UnitsSectionProps {
  heading: string
  subtitle: string
  units: UnitView[]
}

export function UnitsSection({ heading, subtitle, units }: UnitsSectionProps) {
  return (
    <Section tone="muted">
      <Container className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="font-display text-headline-md text-on-surface">
            {heading}
          </h2>
          <p className="mt-2 text-body-lg text-on-surface-variant">
            {subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {units.map((unit) => (
            <article
              key={unit.slug}
              className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-6 shadow-level1"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container/10 text-primary">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-headline-sm text-on-surface">
                  {unit.label}
                </h3>
              </div>
              <p className="text-body-md text-on-surface-variant">
                {unit.venue ? (
                  <>
                    <span className="text-on-surface">{unit.venue}</span>
                    <br />
                  </>
                ) : null}
                {unit.addressLines.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < unit.addressLines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </p>
              <MapEmbed src={unit.mapEmbedSrc} title={`Mapa - ${unit.label}`} />
              <a
                href={unit.mapLinkHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 self-start rounded-md border border-secondary px-4 py-2 text-label-md text-secondary transition-colors hover:text-primary"
              >
                <MapIcon className="h-[18px] w-[18px]" />
                Ver no mapa
              </a>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
