import { cn } from '../../lib/cn'

export function Quote({
  text,
  author,
  justify = false,
}: {
  text: string
  author?: string
  justify?: boolean
}) {
  return (
    <blockquote
      className={cn(
        'rounded-xl border-l-4 border-secondary bg-secondary/5 px-6 py-5 text-body-lg text-on-surface',
        justify && 'text-justify',
      )}
    >
      <p>{text}</p>
      {author ? (
        <footer className="mt-2 text-label-md text-secondary">{author}</footer>
      ) : null}
    </blockquote>
  )
}
