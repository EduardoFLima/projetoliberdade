import { useState } from 'react'
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
      <Link
        to={topHref(item)}
        aria-haspopup="true"
        aria-expanded={open}
        className="rounded-sm text-on-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
      >
        {item.label}
      </Link>
      {open ? (
        <div className="absolute left-0 top-full z-50 min-w-48 pt-2">
          <ul className="rounded-lg bg-surface-container-lowest p-2 shadow-level2">
            {children.map((child) => (
              <li key={child.slug}>
                <Link
                  to={subHref(item, child)}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-on-surface hover:bg-surface-container hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export function Nav({ items }: { items: NavItem[] }) {
  const sorted = [...items].sort(byOrder)
  return (
    <nav aria-label="Principal" className="hidden text-label-md md:block">
      <ul className="hidden items-center gap-6 md:flex">
        {sorted.map((item) => (
          <li key={item.slug}>
            {item.submenu ? (
              <Submenu item={item} />
            ) : (
              <Link
                to={topHref(item)}
                className="rounded-sm text-on-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
