interface PageHeroProps {
  image: string
  alt: string
  title: string
  subtitle: string
}

export function PageHero({ image, alt, title, subtitle }: PageHeroProps) {
  return (
    <header className="relative flex items-center justify-center overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 z-0">
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 bg-cover opacity-80"
          style={{
            backgroundImage: `url(${image})`,
            backgroundPosition: 'center 20%',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-surface-container/60 to-surface/90"
        />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center md:px-16">
        <h1 className="mb-4 font-display text-display-lg text-on-surface">
          {title}
        </h1>
        <p className="font-sans text-body-lg text-on-surface-variant">
          {subtitle}
        </p>
      </div>
    </header>
  )
}
