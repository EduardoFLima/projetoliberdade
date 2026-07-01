import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { NavItem } from '../content/types'

const byOrder = (a: NavItem, b: NavItem) => a.order - b.order
const topHref = (item: NavItem) =>
  item.slug === 'home' ? '/' : `/${item.slug}`
const subHref = (parent: NavItem, child: NavItem) =>
  `/${parent.slug}/${child.slug}`

function Submenu({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false)
  const children = [...(item.submenu ?? [])].sort(byOrder)
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-on-surface hover:text-primary"
      >
        {item.label}
      </button>
      {open ? (
        <ul className="absolute left-0 top-full z-50 mt-2 min-w-48 rounded-lg bg-surface-container-lowest p-2 shadow-level2">
          {children.map((child) => (
            <li key={child.slug}>
              <Link
                to={subHref(item, child)}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-on-surface hover:bg-surface-container hover:text-primary"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function Nav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const sorted = [...items].sort(byOrder)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <nav aria-label="Principal" className="text-label-md">
      <ul className="hidden items-center gap-6 md:flex">
        {sorted.map((item) => (
          <li key={item.slug}>
            {item.submenu ? (
              <Submenu item={item} />
            ) : (
              <Link
                to={topHref(item)}
                className="text-on-surface hover:text-primary"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-on-surface md:hidden"
      >
        <span aria-hidden="true">{open ? '✕' : '☰'}</span>
      </button>

      {open ? (
        <ul
          data-testid="mobile-menu"
          className="mt-4 flex flex-col gap-3 md:hidden"
        >
          {sorted.map((item) => (
            <li key={item.slug}>
              <Link
                to={topHref(item)}
                onClick={() => setOpen(false)}
                className="text-on-surface hover:text-primary"
              >
                {item.label}
              </Link>
              {item.submenu ? (
                <ul className="ml-4 mt-2 flex flex-col gap-2">
                  {[...item.submenu].sort(byOrder).map((child) => (
                    <li key={child.slug}>
                      <Link
                        to={subHref(item, child)}
                        onClick={() => setOpen(false)}
                        className="text-on-surface-variant hover:text-primary"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  )
}
