import clsx from 'clsx'
import { X } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'

interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function RightSheet({ isOpen, onClose, title, children, className, ...props }: SheetProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={clsx(
        'fixed top-0 right-0 z-40 h-full w-full max-w-xl border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-in-out flex flex-col translate-x-0 animate-in slide-in-from-right',
        className,
      )}
      {...props}
    >
      {/* Header Action Row */}
      <div className='flex items-center justify-between border-b border-border px-6 py-4'>
        <h2 className='text-sm font-bold text-foreground tracking-tight uppercase'>{title}</h2>
        <Button variant='ghost' size='icon' onClick={onClose} className='h-8 w-8 rounded-full'>
          <X className='h-4 w-4' />
        </Button>
      </div>

      {/* Scrollable Main Content Stream */}
      <div className='flex-1 overflow-y-auto p-6'>{children}</div>
    </div>
  )
}
