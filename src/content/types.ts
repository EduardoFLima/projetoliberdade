export interface SocialLink {
  network: string
  url: string
}

export interface Site {
  name: string
  logo: string
  social: SocialLink[]
}

export interface NavItem {
  slug: string
  label: string
  order: number
  submenu?: NavItem[]
}

/**
 * Page is intentionally loose during the scaffold phase. Full typing of
 * body blocks, photos, videos, and units is deferred to the content/component
 * build phase (see the TODO map in CLAUDE.md).
 */
export interface Page {
  slug: string
  title: string
  [key: string]: unknown
}

export interface SiteContent {
  site: Site
  navigation: NavItem[]
  pages: Record<string, Page>
}

export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level?: 2 | 3 }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt: string }
  | { type: 'quote'; text: string; author?: string }

export interface Video {
  slug: string
  title: string
  order: number
  url: string
}

export interface Photo {
  src: string
  alt: string
  caption?: string
}

export interface Album {
  slug: string
  title: string
  cover: Photo
  photos: Photo[]
}
