import { Link } from 'react-router'
import type { NavItem, Site } from '../content/types'
import { Container } from './ui/Container'
import { Nav } from './Nav'
import { Button } from './ui/Button'
import { ChatIcon } from './ui/icons'

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
          <Button
            to="/contato"
            compact
            pill
            className="hidden items-center gap-1 md:inline-flex"
          >
            <ChatIcon className="h-4 w-4" /> Entre em contato
          </Button>
        </div>
      </Container>
    </header>
  )
}
