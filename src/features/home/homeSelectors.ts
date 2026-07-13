import type {
  Block,
  HeroContent,
  HomeContent,
  SiteContent,
} from '../../content/types'
import type { ServiceCardData } from '../../components/sections/ServicesSection'
import { firstParagraph, paragraphs, selectMvv } from '../../content/selectors'

export { selectMvv }

interface NamedSection {
  slug: string
  title: string
  icon?: string
  body: Block[]
}

interface HistoriaPage {
  title: string
  body: Block[]
}

interface ServicosPage {
  body?: Block[]
  sections?: NamedSection[]
}

export function selectHero(content: SiteContent): HeroContent {
  return (content.pages.home as HomeContent).hero
}

export function selectHistoria(
  content: SiteContent,
  maxParagraphs = 2,
): {
  heading: string
  paragraphs: string[]
  image?: { src: string; alt: string }
} {
  const page = content.pages.historia as unknown as HistoriaPage
  const body = page.body ?? []
  const image = body.find(
    (b): b is Extract<Block, { type: 'image' }> => b.type === 'image',
  )
  return {
    heading: page.title,
    paragraphs: paragraphs(body).slice(0, maxParagraphs),
    image: image ? { src: image.src, alt: image.alt } : undefined,
  }
}

export function selectServices(content: SiteContent): {
  heading: string
  intro?: string
  services: ServiceCardData[]
} {
  const home = content.pages.home as HomeContent
  const servicos = content.pages.servicos as unknown as ServicosPage
  const sections = servicos.sections ?? []
  const services: ServiceCardData[] = (home.featuredServices ?? [])
    .map((slug) => sections.find((s) => s.slug === slug))
    .filter((s): s is NamedSection => Boolean(s))
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      excerpt: firstParagraph(s.body),
      to: `/servicos/${s.slug}`,
      icon: s.icon ?? '',
    }))
  return {
    heading: 'Nossos Serviços',
    intro: servicos.body ? firstParagraph(servicos.body) : undefined,
    services,
  }
}
