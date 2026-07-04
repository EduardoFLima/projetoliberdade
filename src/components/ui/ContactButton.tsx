import { cn } from '../../lib/cn'
import { Button } from './Button'
import { ChatIcon } from './icons'

export function ContactButton({ className }: { className?: string }) {
  return (
    <Button to="/contato" pill className={cn('items-center gap-1', className)}>
      <ChatIcon className="h-4 w-4" /> Entre em contato
    </Button>
  )
}
