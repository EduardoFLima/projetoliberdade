import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface ChipProps {
  tone?: 'primary' | 'secondary'
  className?: string
  children: ReactNode
}

export function Chip({ tone = 'primary', className, children }: ChipProps) {
  const toneClass =
    tone === 'secondary'
      ? 'bg-secondary/10 text-on-secondary-container'
      : 'bg-primary/10 text-on-primary-container'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-label-sm',
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  )
}
