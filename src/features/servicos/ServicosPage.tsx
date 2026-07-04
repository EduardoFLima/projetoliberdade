import { useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { ServicesSection } from '../../components/sections/ServicesSection'
import { FeatureSpotlight } from '../../components/sections/FeatureSpotlight'
import { ContactCta } from '../../components/sections/ContactCta'
import { selectHippussuit, selectServicesGrid } from './servicosSelectors'

export function ServicosPage() {
  const content = useOutletContext<SiteContent>()
  const grid = selectServicesGrid(content)
  const hippussuit = selectHippussuit(content)

  return (
    <>
      <ServicesSection
        tone="surface"
        heading={grid.heading}
        intro={grid.intro}
        services={grid.services}
        headingLevel="h1"
      />
      <FeatureSpotlight
        tone="muted"
        title={hippussuit.title}
        paragraphs={hippussuit.paragraphs}
        highlights={hippussuit.highlights}
        image={hippussuit.image}
      />
      <ContactCta
        tone="surface"
        heading="Agende uma Avaliação"
        body="Venha conhecer nosso espaço e nossos profissionais. Estamos prontos para oferecer o melhor atendimento para você e sua família."
      />
    </>
  )
}
