import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface SectionProps {
  tone?: 'surface' | 'muted'
  className?: string
  children: ReactNode
}

export function Section({ tone = 'surface', className, children }: SectionProps) {
  const toneClass = tone === 'muted' ? 'bg-surface-container-low' : 'bg-surface'
  return (
    <section className={cn('py-12 md:py-20', toneClass, className)}>
      {children}
    </section>
  )
}
