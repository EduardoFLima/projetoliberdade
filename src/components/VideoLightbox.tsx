import { useEffect, useRef } from 'react'

interface VideoLightboxProps {
  title: string
  embedUrl: string
  onClose: () => void
}

export function VideoLightbox({
  title,
  embedUrl,
  onClose,
}: VideoLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/90 p-4"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl">
        <div className="aspect-video overflow-hidden rounded-lg">
          <iframe
            src={`${embedUrl}?autoplay=1`}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
      <button
        ref={closeRef}
        type="button"
        aria-label="Fechar"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute right-4 top-4 text-inverse-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  )
}
