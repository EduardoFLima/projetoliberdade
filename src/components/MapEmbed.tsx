import { cn } from '../lib/cn'

interface MapEmbedProps {
  src: string
  title: string
  className?: string
}

export function MapEmbed({ src, title, className }: MapEmbedProps) {
  return (
    <iframe
      src={src}
      title={title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      className={cn(
        'aspect-video w-full rounded-lg border-0 shadow-level1',
        className,
      )}
    />
  )
}
