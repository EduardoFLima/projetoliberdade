import type { ElementType, ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface CardProps {
  as?: ElementType
  elevated?: boolean
  className?: string
  children: ReactNode
}

export function Card({
  as: Tag = 'div',
  elevated = false,
  className,
  children,
}: CardProps) {
  return (
    <Tag
      className={cn(
        'rounded-lg bg-surface-container-lowest p-6',
        elevated ? 'shadow-level2' : 'shadow-level1',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
