import type { ReactElement } from 'react'
import type { SocialLink } from '../content/types'

const labels: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
}

const icons: Record<string, ReactElement> = {
  facebook: (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13 22v-8h2.7l.4-3H13V9.1c0-.9.3-1.5 1.6-1.5H16V5c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H7v3h2.8v8H13z" />
    </svg>
  ),
  instagram: (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
}

const linkClass: Record<'inline' | 'buttons', string> = {
  inline: 'text-on-surface-variant hover:text-primary',
  buttons:
    'flex h-12 w-12 items-center justify-center rounded-full border border-surface-container-highest bg-surface-container-lowest text-primary shadow-level1 transition-colors hover:bg-primary hover:text-on-primary',
}

export function SocialLinks({
  links,
  variant = 'inline',
}: {
  links: SocialLink[]
  variant?: 'inline' | 'buttons'
}) {
  return (
    <ul className="flex gap-4">
      {links.map((link) => (
        <li key={link.network}>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            aria-label={labels[link.network] ?? link.network}
            className={linkClass[variant]}
          >
            {icons[link.network] ?? <span aria-hidden="true">↗</span>}
          </a>
        </li>
      ))}
    </ul>
  )
}
