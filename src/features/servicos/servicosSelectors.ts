import type { Block, SiteContent } from '../../content/types'
import type { ServiceCardData } from '../../components/sections/ServicesSection'
import type { HippussuitContent } from '../../components/sections/HippussuitSection'
import { firstParagraph, paragraphs } from '../../content/selectors'

interface ServiceSection {
  slug: string
  title: string
  order?: number
  icon?: string
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
      icon: s.icon,
    })),
  }
}

export function selectHippussuit(content: SiteContent): HippussuitContent {
  const page = content.pages.servicos as unknown as ServicosPageContent
  const section = (page.sections ?? []).find((s) => s.slug === 'hippussuit')
  const body = section?.body ?? []
  const title = section?.title ?? 'Hippussuit'

  const headings = body
    .filter(
      (b): b is Extract<Block, { type: 'heading' }> => b.type === 'heading',
    )
    .map((b) => b.text)
  const paras = paragraphs(body)
  const lists = body.filter(
    (b): b is Extract<Block, { type: 'list' }> => b.type === 'list',
  )

  return {
    title,
    image: { src: '/images/hippussuit.jpg', alt: title },
    intro: paras[0] ?? '',
    whatIsIt: { heading: headings[0] ?? '', text: paras[1] ?? '' },
    howItWorks: { heading: headings[1] ?? '', text: paras[2] ?? '' },
    motor: { heading: headings[2] ?? '', items: lists[0]?.items ?? [] },
    behavioral: { heading: headings[3] ?? '', items: lists[1]?.items ?? [] },
    closing: paras.slice(3, 5),
    developedBy: { label: paras[5] ?? '', items: lists[2]?.items ?? [] },
  }
}
