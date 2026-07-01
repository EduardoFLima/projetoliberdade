export function ImageBlock({ src, alt }: { src: string; alt: string }) {
  return (
    <figure>
      <img src={src} alt={alt} loading="lazy" className="w-full rounded-lg" />
    </figure>
  )
}
