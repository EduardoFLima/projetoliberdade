import { useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { PageHero } from '../../components/sections/PageHero'
import { ContactChannels } from '../../components/sections/ContactChannels'
import { UnitsSection } from '../../components/sections/UnitsSection'
import {
  selectContactChannels,
  selectContatoHero,
  selectUnits,
} from './contatoSelectors'

export function ContatoPage() {
  const content = useOutletContext<SiteContent>()
  const hero = selectContatoHero(content)
  const channels = selectContactChannels(content)
  const units = selectUnits(content)

  return (
    <>
      <PageHero image="" alt="" title={hero.title} subtitle={hero.subtitle} />
      <ContactChannels
        heading={channels.heading}
        socialHeading={channels.socialHeading}
        whatsapps={channels.whatsapps}
        email={channels.email}
        social={content.site.social}
      />
      <UnitsSection
        heading={units.heading}
        subtitle={units.subtitle}
        units={units.units}
      />
    </>
  )
}

export default ContatoPage
