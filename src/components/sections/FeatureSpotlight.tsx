import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { CheckCircleIcon } from '../ui/icons'

interface FeatureSpotlightProps {
  title: string
  paragraphs: string[]
  highlights: string[]
  image: { src: string; alt: string }
  tone?: 'surface' | 'muted'
}

export function FeatureSpotlight({
  title,
  paragraphs,
  highlights,
  image,
  tone = 'surface',
}: FeatureSpotlightProps) {
  return (
    <Section tone={tone}>
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl shadow-level1">
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-6">
            <h2 className="font-display text-headline-md text-secondary">
              {title}
            </h2>
            {paragraphs.map((text) => (
              <p
                key={text}
                className="font-sans text-body-md text-on-surface-variant"
              >
                {text}
              </p>
            ))}
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-cta" />
                  <span className="font-sans text-body-md text-on-surface">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  )
}
