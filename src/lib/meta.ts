import type { MetaDescriptor } from 'react-router'
import type { Page } from '../content/types'

/**
 * Builds the meta-descriptor array returned by route-module `meta` exports:
 * document title plus Open Graph tags, with optional description.
 */
export function pageMeta(
  title: string,
  description?: string,
): MetaDescriptor[] {
  const tags: MetaDescriptor[] = [
    { title },
    { property: 'og:title', content: title },
    { property: 'og:type', content: 'website' },
  ]
  if (description) {
    tags.push(
      { name: 'description', content: description },
      { property: 'og:description', content: description },
    )
  }
  return tags
}

/**
 * Page blocks are loosely typed ([key: string]: unknown), so hero subtitles
 * are read defensively for use as meta descriptions.
 */
export function heroSubtitle(page: Page): string | undefined {
  const hero = (page as { hero?: { subtitle?: unknown } }).hero
  return typeof hero?.subtitle === 'string' ? hero.subtitle : undefined
}
