import { Link } from 'react-router'
import type { NavItem, Site } from '../content/types'
import { Container } from './ui/Container'
import { SocialLinks } from './SocialLinks'

const byOrder = (a: NavItem, b: NavItem) => a.order - b.order
const href = (item: NavItem) => (item.slug === 'home' ? '/' : `/${item.slug}`)

export function Footer({
  site,
  navigation,
}: {
  site: Site
  navigation: NavItem[]
}) {
  const items = [...navigation].sort(byOrder)
  return (
    <footer
      data-testid="site-footer"
      className="mt-auto rounded-t-xl bg-surface-container"
    >
      <Container className="flex flex-col items-center gap-6 py-12 md:flex-row md:justify-between">
        <p className="font-display text-headline-sm text-primary">
          {site.name}
        </p>
        <nav
          aria-label="Rodapé"
          className="flex flex-wrap justify-center gap-x-6 gap-y-2"
        >
          {items.map((item) => (
            <Link
              key={item.slug}
              to={href(item)}
              className="text-label-md text-on-surface-variant transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <SocialLinks links={site.social} />
      </Container>
    </footer>
  )
}
