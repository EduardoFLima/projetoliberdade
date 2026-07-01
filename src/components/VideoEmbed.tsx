import type { Video } from '../content/types'

export function VideoEmbed({ video }: { video: Video }) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="aspect-video overflow-hidden rounded-lg">
        <iframe
          src={video.url}
          title={video.title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <figcaption className="text-label-md text-on-surface-variant">
        {video.title}
      </figcaption>
    </figure>
  )
}
