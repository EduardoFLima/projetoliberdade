const ID_RE = /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/

export function getYouTubeId(url: string): string | null {
  const match = ID_RE.exec(url)
  return match ? match[1] : null
}

export function thumbnailUrl(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

export function watchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`
}

export function embedUrl(id: string): string {
  return `https://www.youtube.com/embed/${id}`
}
