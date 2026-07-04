import { cn } from '../../lib/cn'

interface SectionHeadingProps {
  title: string
  intro?: string
  className?: string
  level?: 'h1' | 'h2'
}

export function SectionHeading({
  title,
  intro,
  className,
  level = 'h2',
}: SectionHeadingProps) {
  const Heading = level
  return (
    <div className={cn('mx-auto mb-12 max-w-2xl text-center', className)}>
      <Heading className="mb-3 font-display text-headline-md text-secondary">
        {title}
      </Heading>
      <div className="mx-auto h-1 w-16 rounded-full bg-primary" />
      {intro ? (
        <p className="mt-6 font-sans text-body-md text-on-surface-variant">
          {intro}
        </p>
      ) : null}
    </div>
  )
}
