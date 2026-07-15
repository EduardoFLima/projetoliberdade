import { useParams, useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { ServicesSection } from '../../components/sections/ServicesSection'
import { HippussuitSection } from '../../components/sections/HippussuitSection'
import { ContactCta } from '../../components/sections/ContactCta'
import { selectHippussuit, selectServicesGrid } from './servicosSelectors'

export function ServicosPage() {
  const { slug } = useParams()
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
        activeSlug={slug}
        selectable
      />
      <HippussuitSection
        hippussuit={hippussuit}
        isActive={slug === 'hippussuit'}
      />
      <ContactCta
        tone="surface"
        heading="Agende uma Avaliação"
        body="Venha conhecer nosso espaço e nossos profissionais. Estamos prontos para oferecer o melhor atendimento para você e sua família."
      />
    </>
  )
}

export default ServicosPage
