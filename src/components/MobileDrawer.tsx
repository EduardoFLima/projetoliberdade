import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import type { NavItem } from '../content/types'
import { cn } from '../lib/cn'
import { CloseIcon } from './ui/icons'

const byOrder = (a: NavItem, b: NavItem) => a.order - b.order
const topHref = (item: NavItem) => (item.slug === 'home' ? '/' : `/${item.slug}`)
const subHref = (parent: NavItem, child: NavItem) =>
  `/${parent.slug}/${child.slug}`

interface MobileDrawerProps {
  items: NavItem[]
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ items, open, onClose }: MobileDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const sorted = [...items].sort(byOrder)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-50 md:hidden',
        open ? '' : 'pointer-events-none',
      )}
    >
      <div
        data-testid="drawer-scrim"
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-inverse-surface/50 transition-opacity duration-300 motion-reduce:transition-none',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        id="mobile-drawer"
        data-testid="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open ? true : undefined}
        className={cn(
          'absolute inset-y-0 left-0 flex h-full w-4/5 max-w-xs flex-col bg-surface shadow-level2 transition-transform duration-300 motion-reduce:transition-none',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex justify-end p-4">
          <button
            ref={closeRef}
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="rounded-sm text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col gap-2 px-4 pb-8 text-label-md">
          {sorted.map((item) => (
            <div key={item.slug}>
              <Link
                to={topHref(item)}
                onClick={onClose}
                className="block rounded-sm py-2 text-on-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              >
                {item.label}
              </Link>
              {item.submenu ? (
                <div className="ml-4 flex flex-col gap-1">
                  {[...item.submenu].sort(byOrder).map((child) => (
                    <Link
                      key={child.slug}
                      to={subHref(item, child)}
                      onClick={onClose}
                      className="block rounded-sm py-1 text-on-surface-variant hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
