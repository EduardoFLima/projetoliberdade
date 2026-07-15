import { useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { Hero } from '../../components/sections/Hero'
import { HistoriaSection } from '../../components/sections/HistoriaSection'
import { MissionVisionValues } from '../../components/sections/MissionVisionValues'
import { ServicesSection } from '../../components/sections/ServicesSection'
import {
  selectHero,
  selectHistoria,
  selectMvv,
  selectServices,
} from './homeSelectors'

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
