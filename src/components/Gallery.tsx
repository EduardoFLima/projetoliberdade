import { useState } from 'react'
import type { Album, Photo } from '../content/types'
import { Lightbox } from './Lightbox'

interface OpenState {
  photos: Photo[]
  index: number
}

export function Gallery({ albums }: { albums: Album[] }) {
  const [open, setOpen] = useState<OpenState | null>(null)
  return (
    <div className="flex flex-col gap-12">
      {albums.map((album) => (
        <section key={album.slug} aria-labelledby={`album-${album.slug}`}>
          <h3
            id={`album-${album.slug}`}
            className="font-display text-headline-sm text-on-surface"
          >
            {album.title}
          </h3>
          <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            {album.photos.map((photo, i) => (
              <li key={photo.src}>
                <button
                  type="button"
                  onClick={() => setOpen({ photos: album.photos, index: i })}
                  className="block w-full overflow-hidden rounded-lg"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {open ? (
        <Lightbox
          photos={open.photos}
          startIndex={open.index}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  )
}
