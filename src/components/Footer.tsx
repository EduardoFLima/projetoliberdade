import type { Site } from '../content/types'
import { Container } from './ui/Container'
import { SocialLinks } from './SocialLinks'

export function Footer({ site }: { site: Site }) {
  return (
    <footer
      data-testid="site-footer"
      className="bg-inverse-surface text-inverse-on-surface"
    >
      <Container className="flex flex-col gap-4 py-12 md:flex-row md:items-center md:justify-between">
        <p className="font-display text-headline-sm">{site.name}</p>
        <SocialLinks links={site.social} />
      </Container>
    </footer>
  )
}
