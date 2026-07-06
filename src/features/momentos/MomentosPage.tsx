import { useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { Container } from '../../components/ui/Container'
import { Section } from '../../components/ui/Section'
import { MediaToggle } from '../../components/MediaToggle'
import { VideoGallery } from '../../components/sections/VideoGallery'
import { selectMomentosHeader, selectVideos } from './momentosSelectors'

export function MomentosPage() {
  const content = useOutletContext<SiteContent>()
  const header = selectMomentosHeader(content)
  const videos = selectVideos(content)

  return (
    <>
      <Section tone="surface">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h1 className="font-display text-display-lg text-on-surface">
            {header.title}
          </h1>
          <p className="max-w-2xl font-sans text-body-lg text-on-surface-variant">
            {header.subtitle}
          </p>
          <MediaToggle active="videos" />
        </Container>
      </Section>
      <VideoGallery videos={videos} />
    </>
  )
}
