import { useLocation, useOutletContext } from 'react-router'
import type { SiteContent } from '../../content/types'
import { Container } from '../../components/ui/Container'
import { Section } from '../../components/ui/Section'
import { MediaToggle } from '../../components/MediaToggle'
import { VideoGallery } from '../../components/sections/VideoGallery'
import { PhotoGallery } from '../../components/sections/PhotoGallery'
import type { Route } from './+types/MomentosPage'
import {
  momentosMeta,
  selectMomentosHeader,
  selectPhotos,
  selectVideos,
} from './momentosSelectors'

export function meta({ matches }: Route.MetaArgs) {
  return momentosMeta(matches[1]?.loaderData)
}

export function MomentosPage() {
  const content = useOutletContext<SiteContent>()
  const { pathname } = useLocation()
  // Trailing-slash tolerant: React Router's prerenderer requests each HTML
  // page with a trailing slash appended (e.g. `/momentos/fotos/`), while
  // real browser navigation never has one (`/momentos/fotos`). Matching only
  // the exact suffix would silently prerender this page with the videos
  // view instead of photos.
  const view: 'videos' | 'fotos' = /\/fotos\/?$/.test(pathname)
    ? 'fotos'
    : 'videos'

  const header = selectMomentosHeader(content)
  const videos = selectVideos(content)
  const photos = selectPhotos(content)

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
          <MediaToggle active={view} />
        </Container>
      </Section>
      {view === 'fotos' ? (
        <PhotoGallery photos={photos} />
      ) : (
        <VideoGallery videos={videos} />
      )}
    </>
  )
}

export default MomentosPage
