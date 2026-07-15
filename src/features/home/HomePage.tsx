import { useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { Hero } from '../../components/sections/Hero'
import { HistoriaSection } from '../../components/sections/HistoriaSection'
import { MissionVisionValues } from '../../components/sections/MissionVisionValues'
import { ServicesSection } from '../../components/sections/ServicesSection'
import type { Route } from './+types/HomePage'
import { pageMeta } from '../../lib/meta'
import {
  selectHero,
  selectHistoria,
  selectMvv,
  selectServices,
} from './homeSelectors'

export function meta({ matches }: Route.MetaArgs) {
  const content = matches[1]?.loaderData
  if (!content) return pageMeta('Projeto Liberdade')
  const { hero } = content.pages.home
  return pageMeta(`${content.site.name} — ${hero.title}`, hero.subtitle)
}

export function HomePage() {
  const content = useOutletContext<SiteContent>()
  const hero = selectHero(content)
  const historia = selectHistoria(content)
  const mvv = selectMvv(content)
  const services = selectServices(content)

  return (
    <>
      <Hero
        image={hero.image}
        alt={hero.alt}
        title={hero.title}
        subtitle={hero.subtitle}
        logo={content.site.logo}
        logoAlt={content.site.name}
        primaryCta={{ label: 'Nossos Serviços', to: '/servicos' }}
      />
      <HistoriaSection
        tone="surface"
        heading={historia.heading}
        paragraphs={historia.paragraphs}
        image={historia.image}
        cta={{ label: 'Conheça nossa história', to: '/historia' }}
      />
      <MissionVisionValues tone="muted" heading={mvv.heading} body={mvv.body} />
      <ServicesSection
        tone="surface"
        heading={services.heading}
        intro={services.intro}
        services={services.services}
      />
    </>
  )
}

export default HomePage
