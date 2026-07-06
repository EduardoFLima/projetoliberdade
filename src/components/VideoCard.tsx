import type { VideoCardVm } from '../features/momentos/momentosSelectors'

interface VideoCardProps {
  video: VideoCardVm
  onPlay: (video: VideoCardVm) => void
}

export function VideoCard({ video, onPlay }: VideoCardProps) {
  return (
    <figure className="flex flex-col gap-3">
      <button
        type="button"
        aria-label={`Assistir: ${video.title}`}
        onClick={() => onPlay(video)}
        className="group relative block overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
      >
        <img
          src={video.thumbnail}
          alt=""
          loading="lazy"
          className="aspect-video w-full object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cta text-on-cta shadow-level2 transition-transform group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7 translate-x-0.5"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </button>
      <figcaption className="flex flex-col gap-1">
        <span className="font-display text-headline-sm text-on-surface">
          {video.title}
        </span>
        <a
          href={video.watchUrl}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1 text-label-md text-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        >
          Assistir no YouTube
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M7 17L17 7M17 7H8M17 7v9" />
          </svg>
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      </figcaption>
    </figure>
  )
}
