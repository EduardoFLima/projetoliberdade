import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '../../lib/cn'

interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> {
  variant?: 'primary' | 'secondary'
  compact?: boolean
  to?: string
  className?: string
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta'

function variantClasses(
  variant: 'primary' | 'secondary',
  compact: boolean,
): string {
  if (variant === 'secondary')
    return 'border border-secondary text-secondary text-label-md px-6 py-3 hover:bg-secondary/10'
  if (compact) return 'bg-cta-strong text-on-cta text-label-md px-4 py-2'
  return 'bg-cta text-on-cta text-button px-6 py-3 hover:bg-cta-hover'
}

export function Button({
  variant = 'primary',
  compact = false,
  to,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = cn(base, variantClasses(variant, compact), className)
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
