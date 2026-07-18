import { useMemo } from 'react'
import { getColumns } from '@/components/custom/data-view'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { tableCols } from '@/lib/columns/table-columns'
import dayjs from '@/lib/dayjs'
import type { feDocument } from '@/lib/queries/fetch-docs'
import { authStore } from '@/store/auth-store'
import { getName } from '@/lib/utils/get-name'
import { useStore } from '@tanstack/react-store'
import { FileText, Users } from 'lucide-react'

export const useDocumentColumns = () => {
  const currentUserId = useStore(authStore, s => s.user?.id)

  const columns = useMemo(
    () =>
      getColumns<feDocument>(h => [
        tableCols.number(h),

        // Document title
        h.accessor('title', {
          id: 'title',
          header: 'Title',
          minSize: 200,
          cell: info => (
            <div className='flex items-center gap-2 min-w-0'>
              <FileText size={14} className='shrink-0 text-muted-foreground' />
              <span className='truncate font-medium text-sm text-foreground'>
                {info.getValue() || <span className='italic text-muted-foreground'>Untitled</span>}
              </span>
            </div>
          ),
        }),

        // Owner avatar + name
        h.display({
          id: 'owner',
          header: 'Owner',
          size: 140,
          cell: info => {
            const { owner } = info.row.original
            const name = getName(owner)
            const isMe = owner?.id === currentUserId
            return (
              <div className='flex items-center gap-2 min-w-0'>
                <Avatar className='h-6 w-6 shrink-0 border border-border/50'>
                  <AvatarImage src={owner?.image ?? ''} alt={name} />
                  <AvatarFallback className='bg-primary/5 text-primary text-[10px] font-bold uppercase'>
                    {name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className='truncate text-xs text-muted-foreground'>
                  {isMe ? 'You' : name}
                </span>
              </div>
            )
          },
        }),

        // Shared-with count / badge
        h.display({
          id: 'shared',
          header: 'Shared',
          size: 100,
          cell: info => {
            const { shares, ownerId } = info.row.original
            const isOwned = ownerId === currentUserId
            const count = shares?.length ?? 0

            if (!isOwned) {
              return (
                <Badge variant='secondary' className='gap-1'>
                  Shared with you
                </Badge>
              )
            }

            if (count === 0) {
              return <span className='text-xs text-muted-foreground'>Only you</span>
            }

            return (
              <div className='flex items-center gap-1.5'>
                <Users size={13} className='text-muted-foreground' />
                <span className='text-xs text-muted-foreground'>
                  {count} {count === 1 ? 'person' : 'people'}
                </span>
              </div>
            )
          },
        }),

        // Created date
        h.accessor('createdAt', {
          id: 'createdAt',
          header: 'Created',
          size: 120,
          cell: info => {
            const date = info.getValue()
            if (!date) return <span className='text-xs text-muted-foreground'>—</span>
            return (
              <span className='text-xs text-muted-foreground tabular-nums'>
                {dayjs(date).format('MMM D, YYYY')}
              </span>
            )
          },
        }),

        // Last updated
        h.accessor('updatedAt', {
          id: 'updatedAt',
          header: 'Last edited',
          size: 120,
          cell: info => {
            const date = info.getValue()
            if (!date) return <span className='text-xs text-muted-foreground'>—</span>
            return (
              <span className='text-xs text-muted-foreground tabular-nums'>
                {dayjs(date).fromNow()}
              </span>
            )
          },
        }),
      ]),
    [currentUserId],
  )

  return columns
}
