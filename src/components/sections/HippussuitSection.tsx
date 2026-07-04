import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { CheckCircleIcon } from '../ui/icons'

export interface HippussuitContent {
  title: string
  image: { src: string; alt: string }
  intro: string
  whatIsIt: { heading: string; text: string }
  howItWorks: { heading: string; text: string }
  motor: { heading: string; items: string[] }
  behavioral: { heading: string; items: string[] }
  closing: string[]
  developedBy: { label: string; items: string[] }
}

interface HippussuitSectionProps {
  hippussuit: HippussuitContent
  tone?: 'surface' | 'muted'
}

function CheckList({
  items,
  iconClassName,
}: {
  items: string[]
  iconClassName: string
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <CheckCircleIcon
            className={`mt-0.5 h-5 w-5 shrink-0 ${iconClassName}`}
          />
          <span className="font-sans text-body-md text-on-surface-variant">
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function HippussuitSection({
  hippussuit,
  tone = 'surface',
}: HippussuitSectionProps) {
  const {
    title,
    image,
    intro,
    whatIsIt,
    howItWorks,
    motor,
    behavioral,
    closing,
    developedBy,
  } = hippussuit

  return (
    <Section tone={tone}>
      <Container>
        <div className="space-y-12 rounded-xl bg-surface-container-low p-6 md:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="w-full md:w-1/2">
              <div className="overflow-hidden rounded-xl border border-outline-variant/30 shadow-level1">
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
              </div>
            </div>
            <div className="w-full space-y-4 md:w-1/2">
              <h2 className="font-display text-headline-md text-primary">
                {title}
              </h2>
              <p className="font-sans text-body-md text-on-surface-variant">
                {intro}
              </p>
              <h3 className="font-display text-headline-sm text-on-surface">
                {whatIsIt.heading}
              </h3>
              <p className="font-sans text-body-md text-on-surface-variant">
                {whatIsIt.text}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-headline-sm text-on-surface">
              {howItWorks.heading}
            </h3>
            <p className="font-sans text-body-md text-on-surface-variant">
              {howItWorks.text}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-display text-headline-sm text-primary">
                {motor.heading}
              </h3>
              <CheckList items={motor.items} iconClassName="text-primary" />
            </div>
            <div className="space-y-4">
              <h3 className="font-display text-headline-sm text-secondary">
                {behavioral.heading}
              </h3>
              <CheckList
                items={behavioral.items}
                iconClassName="text-secondary"
              />
            </div>
          </div>

          <div className="space-y-6 border-t border-outline-variant/30 pt-8">
            {closing.map((text) => (
              <p
                key={text}
                className="font-sans text-body-md italic text-on-surface-variant"
              >
                {text}
              </p>
            ))}
            <div className="rounded-lg bg-surface-container p-6">
              <p className="mb-2 font-sans text-label-md text-on-surface">
                {developedBy.label}
              </p>
              <ul className="space-y-1">
                {developedBy.items.map((item) => (
                  <li
                    key={item}
                    className="font-sans text-label-sm text-on-surface-variant"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
