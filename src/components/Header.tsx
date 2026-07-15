import { useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import type { NavItem, Site } from '../content/types'
import { Container } from './ui/Container'
import { Nav } from './Nav'
import { ContactButton } from './ui/ContactButton'
import { MobileDrawer } from './MobileDrawer'
import { MenuIcon } from './ui/icons'

const noopSubscribe = () => () => {}

/**
 * The drawer portals into document.body, which doesn't exist during
 * prerendering. useSyncExternalStore lets the client's snapshot (true) differ
 * from the server snapshot (false) on the very first client render, so
 * hydration doesn't mismatch — unlike a `typeof document !== 'undefined'`
 * check, which is already true on the client's first render pass.
 */
function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}

export function Header({
  site,
  navigation,
}: {
  site: Site
  navigation: NavItem[]
}) {
  const [open, setOpen] = useState(false)
  const mounted = useMounted()
  const burgerRef = useRef<HTMLButtonElement>(null)

  const closeDrawer = () => {
    setOpen(false)
    burgerRef.current?.focus()
  }

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-40 border-b border-outline-variant bg-surface/90 backdrop-blur"
    >
      <Container className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 py-4 md:flex md:justify-between">
        <button
          ref={burgerRef}
          type="button"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          aria-controls="mobile-drawer"
          onClick={() => setOpen(true)}
          className="justify-self-start rounded-sm text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta md:hidden"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <Link
          to="/"
          aria-label={site.name}
          className="flex items-center justify-self-center"
        >
          <img
            src={site.logo}
            alt={site.name}
            className="h-12 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-6 justify-self-end">
          <Nav items={navigation} />
          <ContactButton />
        </div>
      </Container>
      {mounted &&
        createPortal(
          <MobileDrawer items={navigation} open={open} onClose={closeDrawer} />,
          document.body,
        )}
    </header>
  )
}
