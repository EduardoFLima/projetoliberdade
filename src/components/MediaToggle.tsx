import { Link } from 'react-router'
import { cn } from '../lib/cn'

interface MediaToggleProps {
  active: 'videos' | 'fotos'
}

const base =
  'rounded-full px-6 py-2 text-label-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta'

export function MediaToggle({ active }: MediaToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-surface-container p-1">
      <Link
        to="/momentos/videos"
        aria-current={active === 'videos' ? 'page' : undefined}
        className={cn(
          base,
          active === 'videos'
            ? 'bg-cta text-on-cta'
            : 'text-on-surface-variant hover:text-primary',
        )}
      >
        Vídeos
      </Link>
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Em breve"
        className={cn(
          base,
          'cursor-not-allowed text-on-surface-variant opacity-50',
        )}
      >
        Fotos
      </button>
    </div>
  )
}
