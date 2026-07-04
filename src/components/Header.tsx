import { Link } from 'react-router'
import type { NavItem, Site } from '../content/types'
import { Container } from './ui/Container'
import { Nav } from './Nav'
import { ContactButton } from './ui/ContactButton'

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
      <Container className="flex items-center justify-between gap-6 py-4">
        <Link to="/" aria-label={site.name} className="flex items-center">
          <img
            src={site.logo}
            alt={site.name}
            className="h-12 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-6">
          <Nav items={navigation} />
          <ContactButton className="hidden md:inline-flex" />
        </div>
      </Container>
    </header>
  )
}
