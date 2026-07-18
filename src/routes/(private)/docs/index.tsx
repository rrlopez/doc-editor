import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { debounce } from 'lodash'
import { Plus } from 'lucide-react'
import { useCallback } from 'react'
import { z } from 'zod'
import { Dashboard } from '@/components/custom/dashboard'
import { TableView } from '@/components/custom/data-view/table-view'
import { type DateRange, DateRangeInput } from '@/components/custom/form/date-rage-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import dayjs from '@/lib/dayjs'
import { type feDocument, fetchDocs, fetchDocumentCount } from '@/lib/queries/fetch-docs'
import { authStore } from '@/store/auth-store'
import { useDocumentColumns } from './-components/doc-columns'

const docsSearchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  allTime: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
})

export const Route = createFileRoute('/(private)/docs/')({
  validateSearch: (search: Record<string, unknown>) => {
    const parsed = docsSearchSchema.parse(search)
    // Only inject this-month defaults when the user hasn't explicitly chosen "All Time"
    // and hasn't already provided a custom date range.
    if (!parsed.allTime && !parsed.from && !parsed.to) {
      return {
        ...parsed,
        from: dayjs().startOf('month').format('YYYY-MM-DD'),
        to: dayjs().endOf('month').format('YYYY-MM-DD'),
      }
    }
    return parsed
  },
  component: RouteComponent,
  shouldReload: false,
})

function RouteComponent() {
  const { from, to, allTime, search = '', page = 1, pageSize = 20 } = useSearch({ from: '/(private)/docs/' })
  const documentId = useStore(authStore, state => state.documentId)
  const navigate = useNavigate({ from: Route.fullPath })
  const { data: docs, isLoading } = fetchDocs({ page, pageSize, search, from, to })
  const totalItems = fetchDocumentCount({ page, pageSize, search, from, to })
  const columns = useDocumentColumns()

  const handleDateChange = (range: DateRange) => {
    if (!range) {
      // "All Time" selected — remove date bounds and set the allTime flag
      navigate({
        search: prev => {
          const next = { ...prev }
          delete next.from
          delete next.to
          return { ...next, allTime: true }
        },
      })
      return
    }

    navigate({
      search: prev => {
        const next = { ...prev }
        delete next.allTime
        return {
          ...next,
          from: range.from ? dayjs(range.from).format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD'),
          to: range.to ? dayjs(range.to).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD'),
        }
      },
    })
  }

  const handleNewDoc = (id: string = 'create') => {
    navigate({ to: `/docs/${id}` })
  }

  const handleSelectRow = (document: feDocument) => {
    navigate({ to: `/docs/${document.id}` })
  }

  const handleSearchChange = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      navigate({ search: prev => ({ ...prev, search: e.target.value }), replace: true })
    }, 400),
    [],
  )

  return (
    <Dashboard>
      <div className='w-full grow h-1 bg-background flex overflow-hidden relative flex-col p-2 gap-2'>
        <div className='w-full flex flex-col sm:flex-row  items-start sm:items-center gap-4 shrink-0'>
          <div className='flex gap-2 grow'>
            <DateRangeInput
              value={allTime ? undefined : { from: from ? new Date(from) : undefined, to: to ? new Date(to) : undefined }}
              onChange={handleDateChange}
              placeholder='All time'
            />
          </div>
          <Input className='h-6 max-w-80' placeholder='Search...' defaultValue={search} onChange={handleSearchChange} />
          <Button size='sm' onClick={() => handleNewDoc()} className='shadow-xs transition-all hover:scale-[1.01] shrink-0 font-medium text-xs h-8'>
            <Plus className='h-4! w-4!' /> Create New Doc
          </Button>
        </div>

        <TableView
          data={docs}
          isFetching={isLoading}
          columns={columns}
          selectableRow={{
            isSelected: document => document.id === documentId,
            onClick: handleSelectRow,
          }}
          paginable={{
            pageSize,
            pageIndex: page - 1,
            totalItems: totalItems,
            onPaginationChange: next => {
              const pageSizeChanged = next.pageSize !== pageSize
              navigate({
                search: prev => ({
                  ...prev,
                  page: pageSizeChanged ? 1 : next.pageIndex + 1,
                  pageSize: next.pageSize,
                }),
                replace: true,
              })
            },
          }}
        />
      </div>
    </Dashboard>
  )
}
