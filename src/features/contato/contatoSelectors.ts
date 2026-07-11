import type { SiteContent } from '../../content/types'

interface Phone {
  name: string
  number: string
  whatsapp?: boolean
}

interface UnitAddress {
  street: string
  district: string
  city: string
  state: string
  postalCode?: string
}

interface UnitContent {
  slug: string
  name: string
  label: string
  address: UnitAddress
  map?: { query?: string; coordinates?: { lat: number; lng: number } }
}

interface ContatoPageContent {
  title: string
  hero?: { title: string; subtitle: string }
  channelsHeading?: string
  socialHeading?: string
  unitsHeading?: string
  unitsSubtitle?: string
  email: string
  phones: Phone[]
  units: UnitContent[]
}

export interface WhatsAppChannel {
  name: string
  number: string
  tel: string
  waHref: string
}

export interface ContactChannels {
  heading: string
  socialHeading: string
  whatsapps: WhatsAppChannel[]
  email: string
}

export interface UnitView {
  slug: string
  label: string
  venue?: string
  addressLines: string[]
  mapEmbedSrc: string
  mapLinkHref: string
}

export interface UnitsView {
  heading: string
  subtitle: string
  units: UnitView[]
}

const MAPS_EMBED = 'https://www.google.com/maps'
const MAPS_SEARCH = 'https://www.google.com/maps/search/?api=1'

function page(content: SiteContent): ContatoPageContent {
  return content.pages.contato as unknown as ContatoPageContent
}

function digits(number: string): string {
  return `55${number.replace(/\D/g, '')}`
}

function telHref(number: string): string {
  return `+${digits(number)}`
}

function waHref(number: string): string {
  return `https://wa.me/${digits(number)}`
}

function mapQuery(unit: UnitContent): string {
  if (unit.map?.coordinates) {
    const { lat, lng } = unit.map.coordinates
    return `${lat},${lng}`
  }
  return unit.map?.query ?? `${unit.address.street}, ${unit.address.city}`
}

export function selectContatoHero(content: SiteContent): {
  title: string
  subtitle: string
} {
  const p = page(content)
  return { title: p.hero?.title ?? p.title, subtitle: p.hero?.subtitle ?? '' }
}

export function selectContactChannels(content: SiteContent): ContactChannels {
  const p = page(content)
  return {
    heading: p.channelsHeading ?? 'Fale Conosco',
    socialHeading: p.socialHeading ?? 'Redes Sociais',
    whatsapps: p.phones
      .filter((phone) => phone.whatsapp)
      .map((phone) => ({
        name: phone.name,
        number: phone.number,
        tel: telHref(phone.number),
        waHref: waHref(phone.number),
      })),
    email: p.email,
  }
}

export function selectUnits(content: SiteContent): UnitsView {
  const p = page(content)
  return {
    heading: p.unitsHeading ?? 'Nossas Unidades',
    subtitle: p.unitsSubtitle ?? '',
    units: p.units.map((unit) => {
      const encoded = encodeURIComponent(mapQuery(unit))
      return {
        slug: unit.slug,
        label: unit.label,
        venue: /^Unidade/.test(unit.name) ? undefined : unit.name,
        addressLines: [
          unit.address.street,
          unit.address.district,
          `${unit.address.city} - ${unit.address.state}`,
        ],
        mapEmbedSrc: `${MAPS_EMBED}?q=${encoded}&output=embed`,
        mapLinkHref: `${MAPS_SEARCH}&query=${encoded}`,
      }
    }),
  }
}
