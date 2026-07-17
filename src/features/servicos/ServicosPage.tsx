import { useParams, useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { ServicesSection } from '../../components/sections/ServicesSection'
import { HippussuitSection } from '../../components/sections/HippussuitSection'
import { ContactCta } from '../../components/sections/ContactCta'
import type { Route } from './+types/ServicosPage'
import { pageMeta } from '../../lib/meta'
import { selectHippussuit, selectServicesGrid } from './servicosSelectors'

export function meta({ params, matches }: Route.MetaArgs) {
  const content = matches[1]?.loaderData
  if (!content) return pageMeta('Projeto Liberdade')
  const grid = selectServicesGrid(content)
  const service = grid.services.find((s) => s.slug === params.slug)
  const hippussuit =
    params.slug === 'hippussuit' ? selectHippussuit(content) : undefined
  const title =
    service?.title ?? hippussuit?.title ?? content.pages.servicos.title
  return pageMeta(
    `${title} — ${content.site.name}`,
    service?.excerpt ?? hippussuit?.intro ?? grid.intro,
  )
}

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
