import { useState } from 'react'
import type { Photo } from '../../content/types'
import { Lightbox } from '../Lightbox'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { cn } from '../../lib/cn'

interface PhotoGalleryProps {
  photos: Photo[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  return (
    <Section tone="surface">
      <Container>
        <ul
          data-testid="photo-gallery"
          className="grid auto-rows-[280px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6"
        >
          {photos.map((photo, i) => (
            <li
              key={photo.src}
              className={cn(i === 0 && 'md:col-span-2 md:row-span-2')}
              data-testid="photo-gallery-item"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`Ampliar foto: ${photo.alt}`}
                className="group block h-full w-full overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </button>
            </li>
          ))}
        </ul>
      </Container>
      {openIndex !== null ? (
        <Lightbox
          photos={photos}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
    </Section>
  )
}
