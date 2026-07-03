import type { Block, SiteContent } from '../../content/types'
import { paragraphs, selectMvv } from '../../content/selectors'

export { selectMvv }

interface HistoriaHero {
  title: string
  subtitle: string
}

interface HistoriaPage {
  title: string
  hero?: HistoriaHero
  body?: Block[]
}

const HERO_IMAGE = '/images/historia-hero.jpg'
const HERO_IMAGE_ALT =
  'Criança em sessão de equoterapia ao pôr do sol, conduzida por uma terapeuta no campo'

export function selectHistoriaHero(content: SiteContent): {
  title: string
  subtitle: string
  image: string
  alt: string
} {
  const page = content.pages.historia as unknown as HistoriaPage
  return {
    title: page.hero?.title ?? page.title,
    subtitle: page.hero?.subtitle ?? '',
    image: HERO_IMAGE,
    alt: HERO_IMAGE_ALT,
  }
}

export function selectHistoriaNarrative(content: SiteContent): {
  paragraphs: string[]
  image?: { src: string; alt: string }
  quote?: { text: string; author?: string }
} {
  const page = content.pages.historia as unknown as HistoriaPage
  const body = page.body ?? []
  const image = body.find(
    (b): b is Extract<Block, { type: 'image' }> => b.type === 'image',
  )
  const quote = body.find(
    (b): b is Extract<Block, { type: 'quote' }> => b.type === 'quote',
  )
  return {
    paragraphs: paragraphs(body),
    image: image ? { src: image.src, alt: image.alt } : undefined,
    quote: quote ? { text: quote.text, author: quote.author } : undefined,
  }
}
