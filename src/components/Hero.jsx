import { useState, useEffect, useCallback } from 'react'
import logo from '../assets/logo.png'
import { getImageUrl } from '../utils/imageUrl'

export default function Hero({ data }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const images = data
    ? Object.values(data).map((item) => getImageUrl(item.src))
    : []

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide, images.length])

  return (
    <section
      id="inicio"
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      aria-label="Página inicial"
    >
      {/* Background carousel */}
      <div className="absolute inset-0" aria-hidden="true">
        {images.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-900/60 via-black/30 to-primary-900/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <img
          src={logo}
          alt="Projeto Liberdade"
          className="w-48 sm:w-64 mx-auto mb-6 drop-shadow-lg"
        />
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 font-[var(--font-heading)]">
          Projeto Liberdade
        </h1>
        <p className="text-lg sm:text-xl text-white/90 mb-8">
          Reabilitação e Equoterapia
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#servicos"
            className="px-6 py-3 bg-primary-600 text-white rounded-[var(--radius-button)] font-medium hover:bg-primary-700 transition-colors no-underline shadow-lg"
          >
            Nossos Serviços
          </a>
          <a
            href="#contato"
            className="px-6 py-3 bg-secondary-700/80 text-white border border-white/30 rounded-[var(--radius-button)] font-medium hover:bg-secondary-700 transition-colors no-underline backdrop-blur-sm shadow-lg"
          >
            Entre em Contato
          </a>
        </div>
      </div>

      {/* Slide indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2" role="tablist" aria-label="Slides">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Slide ${index + 1}`}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
