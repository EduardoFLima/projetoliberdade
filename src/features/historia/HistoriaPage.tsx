import { useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { PageHero } from '../../components/sections/PageHero'
import { HistoriaSection } from '../../components/sections/HistoriaSection'
import { MissionVisionValues } from '../../components/sections/MissionVisionValues'
import {
  selectHistoriaHero,
  selectHistoriaNarrative,
  selectMvv,
} from './historiaSelectors'

export function HistoriaPage() {
  const content = useOutletContext<SiteContent>()
  const hero = selectHistoriaHero(content)
  const narrative = selectHistoriaNarrative(content)
  const mvv = selectMvv(content)

  return (
    <>
      <PageHero
        image={hero.image}
        alt={hero.alt}
        title={hero.title}
        subtitle={hero.subtitle}
      />
      <HistoriaSection
        tone="surface"
        paragraphs={narrative.paragraphs}
        image={narrative.image}
        quote={narrative.quote}
      />
      <MissionVisionValues tone="muted" heading={mvv.heading} body={mvv.body} />
    </>
  )
}
