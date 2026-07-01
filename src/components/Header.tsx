import type { NavItem, Site } from '../content/types'
import { Container } from './ui/Container'
import { Nav } from './Nav'

export function Header({
  site,
  navigation,
}: {
  site: Site
  navigation: NavItem[]
}) {
  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-40 border-b border-outline-variant bg-surface/90 backdrop-blur"
    >
      <Container className="flex items-center justify-between py-4">
        <span className="font-display text-headline-sm text-primary">
          {site.name}
        </span>
        <Nav items={navigation} />
      </Container>
    </header>
  )
}
