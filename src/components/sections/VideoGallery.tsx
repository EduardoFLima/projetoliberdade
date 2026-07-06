import { useState } from 'react'
import type { VideoCardVm } from '../../features/momentos/momentosSelectors'
import { VideoCard } from '../VideoCard'
import { VideoLightbox } from '../VideoLightbox'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'

interface VideoGalleryProps {
  videos: VideoCardVm[]
}

export function VideoGallery({ videos }: VideoGalleryProps) {
  const [open, setOpen] = useState<VideoCardVm | null>(null)
  return (
    <Section tone="surface">
      <Container>
        <ul className="grid gap-8 md:grid-cols-2">
          {videos.map((video) => (
            <li key={video.slug}>
              <VideoCard video={video} onPlay={setOpen} />
            </li>
          ))}
        </ul>
      </Container>
      {open ? (
        <VideoLightbox
          title={open.title}
          embedUrl={open.embedUrl}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </Section>
  )
}
