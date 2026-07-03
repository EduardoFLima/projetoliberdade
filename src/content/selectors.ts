import type { Block, SiteContent } from './types'

interface NamedSection {
  slug: string
  title: string
  body: Block[]
}

interface HistoriaWithSections {
  title: string
  body?: Block[]
  sections?: NamedSection[]
}

export function paragraphs(body: Block[]): string[] {
  return body
    .filter(
      (b): b is Extract<Block, { type: 'paragraph' }> => b.type === 'paragraph',
    )
    .map((b) => b.text)
}

export function firstParagraph(body: Block[]): string {
  return paragraphs(body)[0] ?? ''
}

export function selectMvv(content: SiteContent): {
  heading: string
  body: Block[]
} {
  const page = content.pages.historia as unknown as HistoriaWithSections
  const section = page.sections?.find((s) => s.slug === 'missao-visao-valores')
  return {
    heading: section?.title ?? 'Missão, Visão e Valores',
    body: section?.body ?? [],
  }
}
