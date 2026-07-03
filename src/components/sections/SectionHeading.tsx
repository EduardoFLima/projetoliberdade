import { cn } from '../../lib/cn'

interface SectionHeadingProps {
  title: string
  intro?: string
  className?: string
}

export function SectionHeading({
  title,
  intro,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('mx-auto mb-12 max-w-2xl text-center', className)}>
      <h2 className="mb-3 font-display text-headline-md text-secondary">
        {title}
      </h2>
      <div className="mx-auto h-1 w-16 rounded-full bg-primary" />
      {intro ? (
        <p className="mt-6 font-sans text-body-md text-on-surface-variant">
          {intro}
        </p>
      ) : null}
    </div>
  )
}
