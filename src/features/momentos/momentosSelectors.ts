import type { SiteContent } from '../../content/types'
import {
  embedUrl,
  getYouTubeId,
  thumbnailUrl,
  watchUrl,
} from '../../lib/youtube'

export interface MomentosHeaderVm {
  title: string
  subtitle: string
}

export interface VideoCardVm {
  slug: string
  title: string
  thumbnail: string
  embedUrl: string
  watchUrl: string
}

export function selectMomentosHeader(content: SiteContent): MomentosHeaderVm {
  const page = content.pages.momentos
  return {
    title: page.header?.title ?? page.title,
    subtitle: page.header?.subtitle ?? '',
  }
}

export function selectVideos(content: SiteContent): VideoCardVm[] {
  const page = content.pages.momentos
  const videos = [...(page.videos ?? [])].sort((a, b) => a.order - b.order)
  return videos.flatMap((video) => {
    const id = getYouTubeId(video.url)
    if (!id) return []
    return [
      {
        slug: video.slug,
        title: video.title,
        thumbnail: thumbnailUrl(id),
        embedUrl: embedUrl(id),
        watchUrl: watchUrl(id),
      },
    ]
  })
}
