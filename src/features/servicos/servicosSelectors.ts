import type { Block, SiteContent } from '../../content/types'
import type { ServiceCardData } from '../../components/sections/ServicesSection'
import { firstParagraph, paragraphs } from '../../content/selectors'

interface ServiceSection {
  slug: string
  title: string
  order?: number
  body: Block[]
}

interface ServicosPageContent {
  title: string
  body?: Block[]
  sections?: ServiceSection[]
}

const byOrder = (a: ServiceSection, b: ServiceSection) =>
  (a.order ?? 0) - (b.order ?? 0)

export function selectServicesGrid(content: SiteContent): {
  heading: string
  intro?: string
  services: ServiceCardData[]
} {
  const page = content.pages.servicos as unknown as ServicosPageContent
  const sections = (page.sections ?? [])
    .filter((s) => s.slug !== 'hippussuit')
    .sort(byOrder)
  return {
    heading: 'Nossos Serviços',
    intro: page.body ? firstParagraph(page.body) : undefined,
    services: sections.map((s) => ({
      slug: s.slug,
      title: s.title,
      excerpt: firstParagraph(s.body),
      to: `/servicos/${s.slug}`,
    })),
  }
}

export function selectHippussuit(content: SiteContent): {
  title: string
  paragraphs: string[]
  highlights: string[]
  image: { src: string; alt: string }
} {
  const page = content.pages.servicos as unknown as ServicosPageContent
  const section = (page.sections ?? []).find((s) => s.slug === 'hippussuit')
  const body = section?.body ?? []
  const lists = body.filter(
    (b): b is Extract<Block, { type: 'list' }> => b.type === 'list',
  )
  const [motorHighlights, behavioralHighlights] = lists
  const title = section?.title ?? 'Hippussuit'
  return {
    title,
    paragraphs: paragraphs(body).slice(1, 2),
    highlights: [
      ...(motorHighlights?.items ?? []).slice(0, 1),
      ...(behavioralHighlights?.items ?? []).slice(0, 2),
    ],
    image: { src: '/images/hippussuit.jpg', alt: title },
  }
}
