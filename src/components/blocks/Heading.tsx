export function Heading({ text, level = 2 }: { text: string; level?: 2 | 3 }) {
  const Tag = level === 3 ? 'h3' : 'h2'
  return (
    <Tag className="font-display text-headline-sm text-on-surface">{text}</Tag>
  )
}
