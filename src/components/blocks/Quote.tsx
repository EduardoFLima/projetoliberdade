export function Quote({ text, author }: { text: string; author?: string }) {
  return (
    <blockquote className="rounded-xl border-l-4 border-secondary bg-secondary/5 px-6 py-5 text-body-lg text-on-surface">
      <p>{text}</p>
      {author ? (
        <footer className="mt-2 text-label-md text-secondary">{author}</footer>
      ) : null}
    </blockquote>
  )
}
