import { cn } from '@/lib/utils'

interface TruncatedCellProps {
  value: string | null | undefined
  className?: string
}

export const TruncatedCell = ({ value, className }: TruncatedCellProps) => {
  if (!value) {
    return <span className='text-gray-300 dark:text-gray-600 text-xs'>—</span>
  }

  return <span className={cn('text-xs block text-wrap ', className)}>{value}</span>
}
