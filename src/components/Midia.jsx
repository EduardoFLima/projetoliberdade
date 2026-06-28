import { useState, useEffect, useRef, useCallback } from 'react'
import { getImageUrl } from '../utils/imageUrl'
import SectionHeading from './SectionHeading'

function Lightbox({ images, currentIndex, onClose, onNext, onPrev }) {
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    dialogRef.current?.focus()
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowRight') onNext()
    else if (e.key === 'ArrowLeft') onPrev()
  }, [onClose, onNext, onPrev])

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Visualizador de imagens"
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onKeyDown={handleKeyDown}
      onClick={onClose}
    >
      <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="absolute top-2 right-2 z-10 p-2 text-white bg-black/50 rounded-full hover:bg-black/70"
          aria-label="Fechar"
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button
          type="button"
          className="absolute left-2 p-2 text-white bg-black/50 rounded-full hover:bg-black/70"
          aria-label="Foto anterior"
          onClick={onPrev}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <img
          src={images[currentIndex]}
          alt={`Foto ${currentIndex + 1} de ${images.length}`}
          className="max-h-[85vh] max-w-full object-contain rounded-lg"
        />

        <button
          type="button"
          className="absolute right-2 p-2 text-white bg-black/50 rounded-full hover:bg-black/70"
          aria-label="Próxima foto"
          onClick={onNext}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <p className="absolute bottom-2 text-white/80 text-sm">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </div>
  )
}

function PhotoAlbum({ album }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const photos = album.fotos
    ? Object.values(album.fotos).map((f) => getImageUrl(f.src))
    : []

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }, [photos.length])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }, [photos.length])

  return (
    <div>
      <h4 className="text-lg font-semibold text-neutral-800 mb-3">
        {album.capa?.titulo || 'Álbum'}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((src, index) => (
          <button
            key={src}
            type="button"
            className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-0 p-0"
            onClick={() => {
              setCurrentIndex(index)
              setLightboxOpen(true)
            }}
            aria-label={`Abrir foto ${index + 1}`}
          >
            <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <Lightbox
          images={photos}
          currentIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  )
}

function VideoSection({ videos }) {
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {videos.map((video) => (
        <div key={video.titulo} className="rounded-[var(--radius-card)] overflow-hidden shadow-[var(--shadow-card)]">
          <div className="aspect-video">
            <iframe
              src={video.video?.url?.replace('autoplay=1', 'autoplay=0')}
              title={video.titulo}
              className="w-full h-full"
              allowFullScreen
              loading="lazy"
            />
          </div>
          <div className="p-4 bg-white">
            <h4 className="font-semibold text-neutral-800">{video.titulo}</h4>
            {video.subtitulo && <p className="text-sm text-neutral-500 mt-1">{video.subtitulo}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Midia({ fotos, videos }) {
  const [activeTab, setActiveTab] = useState(0)

  const albums = fotos?.albumList
    ? Object.entries(fotos.albumList)
        .filter(([key]) => key.startsWith('album'))
        .map(([, value]) => value)
    : []

  const videoList = videos
    ? Object.entries(videos)
        .filter(([key]) => key.startsWith('video'))
        .map(([, value]) => value)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    : []

  const tabs = [
    { id: 'fotos', label: 'Fotos' },
    { id: 'videos', label: 'Vídeos' },
  ]

  return (
    <section id="midia" className="py-(--spacing-section) px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SectionHeading className="mb-10">Mídia</SectionHeading>

      <div
        role="tablist"
        aria-label="Tipo de mídia"
        className="flex justify-center gap-1 mb-8 bg-neutral-100 rounded-lg p-1 max-w-xs mx-auto"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`media-tab-${tab.id}`}
            aria-selected={activeTab === index}
            aria-controls={`media-panel-${tab.id}`}
            tabIndex={activeTab === index ? 0 : -1}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === index
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') setActiveTab(1)
              else if (e.key === 'ArrowLeft') setActiveTab(0)
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="media-panel-fotos"
        aria-labelledby="media-tab-fotos"
        hidden={activeTab !== 0}
      >
        <div className="space-y-10">
          {albums.map((album, i) => (
            <PhotoAlbum key={i} album={album} />
          ))}
        </div>
      </div>

      <div
        role="tabpanel"
        id="media-panel-videos"
        aria-labelledby="media-tab-videos"
        hidden={activeTab !== 1}
      >
        <VideoSection videos={videoList} />
      </div>
    </section>
  )
}
