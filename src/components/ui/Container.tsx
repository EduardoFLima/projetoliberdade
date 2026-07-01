import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface ContainerProps {
  className?: string
  children: ReactNode
}

export function Container({ className, children }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-site px-4 md:px-16', className)}>
      {children}
    </div>
  )
}
