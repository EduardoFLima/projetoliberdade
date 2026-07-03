import { Link } from 'react-router'
import { Button } from '../ui/Button'

interface HeroCta {
  label: string
  to: string
}

interface HeroProps {
  image: string
  alt: string
  title: string
  subtitle: string
  logo: string
  logoAlt: string
  primaryCta: HeroCta
  secondaryCta: HeroCta
}

export function Hero({
  image,
  alt,
  title,
  subtitle,
  logo,
  logoAlt,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  return (
    <header className="relative flex min-h-[65vh] items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: `url(${image})`,
            backgroundPosition: 'center 20%',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-secondary/80 mix-blend-multiply"
        />
      </div>
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-4 text-center md:px-16">
        <img
          src={logo}
          alt={logoAlt}
          className="mb-8 h-24 w-auto rounded-xl bg-white/10 p-3 object-contain backdrop-blur-sm md:h-32"
        />
        <h1 className="mb-6 font-display text-display-lg text-on-primary">
          {title}
        </h1>
        <p className="mb-8 max-w-xl font-sans text-body-lg text-on-primary/90">
          {subtitle}
        </p>
        <div className="flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
          <Button to={primaryCta.to} pill>
            {primaryCta.label}
          </Button>
          <Link
            to={secondaryCta.to}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-on-primary px-6 py-3 text-button text-on-primary transition-colors hover:bg-on-primary/10"
          >
            {secondaryCta.label}
          </Link>
        </div>
      </div>
    </header>
  )
}
