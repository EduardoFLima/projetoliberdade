import { useEffect, useState } from 'react'
import type { Photo } from '../content/types'

interface LightboxProps {
  photos: Photo[]
  startIndex?: number
  onClose: () => void
}

export function Lightbox({ photos, startIndex = 0, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex)
  const count = photos.length
  const prev = () => setIndex((i) => (i - 1 + count) % count)
  const next = () => setIndex((i) => (i + 1) % count)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  const photo = photos[index]
  if (!photo) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galeria de fotos"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/90 p-4"
    >
      <figure className="max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.src}
          alt={photo.alt}
          className="mx-auto max-h-[80vh] rounded-lg"
        />
        {photo.caption ? (
          <figcaption className="mt-2 text-center text-label-md text-inverse-on-surface">
            {photo.caption}
          </figcaption>
        ) : null}
      </figure>
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute right-4 top-4 text-inverse-on-surface"
      >
        <span aria-hidden="true">✕</span>
      </button>
      <button
        type="button"
        aria-label="Anterior"
        onClick={(e) => {
          e.stopPropagation()
          prev()
        }}
        className="absolute left-4 top-1/2 text-inverse-on-surface"
      >
        <span aria-hidden="true">‹</span>
      </button>
      <button
        type="button"
        aria-label="Próxima"
        onClick={(e) => {
          e.stopPropagation()
          next()
        }}
        className="absolute right-4 top-1/2 text-inverse-on-surface"
      >
        <span aria-hidden="true">›</span>
      </button>
    </div>
  )
}
