import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'
import { useStore } from '@tanstack/react-store'
import { useEffect } from 'react'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { type Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { clsx } from 'clsx'
import {
  ArrowLeft,
  Bold,
  Check,
  FileUp,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Pilcrow,
  Search,
  Share2,
  Underline as UnderlineIcon,
  Users,
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { Dashboard } from '@/components/custom/dashboard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { documentCollection, documentShareCollection, userCollection } from '@/db/collections'
import { dbTransaction } from '@/db/local-db-transaction'
import { type feDocument, fetchOneDocument } from '@/lib/queries/fetch-docs'
import { getName } from '@/lib/utils/get-name'
import { authStore } from '@/store/auth-store'

export const Route = createFileRoute('/(private)/docs/$documentId/')({
  component: RouteComponent,
})

// Tailwind can't reach ProseMirror's generated markup with named classes, so
// the document body's typography lives here as arbitrary-variant utilities.
const proseClassName = clsx(
  'min-h-[500px] font-serif text-[16px] leading-[1.75] text-foreground outline-none',
  '[&_h1]:mt-0 [&_h1]:mb-5 [&_h1]:text-[30px] [&_h1]:font-bold [&_h1]:leading-[1.3]',
  '[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[23px] [&_h2]:font-bold [&_h2]:leading-[1.35]',
  '[&_h3]:mt-6 [&_h3]:mb-2.5 [&_h3]:text-[19px] [&_h3]:font-semibold [&_h3]:leading-[1.4]',
  '[&_p]:mt-0 [&_p]:mb-4',
  '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6',
  '[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_li]:mb-1.5',
  '[&_strong]:font-bold [&_em]:italic [&_u]:underline',
  '[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
  '[&_.is-editor-empty:first-child::before]:float-left',
  '[&_.is-editor-empty:first-child::before]:h-0',
  '[&_.is-editor-empty:first-child::before]:italic',
  '[&_.is-editor-empty:first-child::before]:text-muted-foreground',
  '[&_.is-editor-empty:first-child::before]:pointer-events-none',
)

function RouteComponent() {
  const { documentId } = Route.useParams()
  const isNew = documentId === 'create'
  const { data, isReady } = fetchOneDocument(isNew ? null : documentId)
  const document = data?.[0] as feDocument | undefined

  const user = useStore(authStore, s => s.user)
  const navigate = useNavigate()

  const [title, setTitle] = useState('Untitled document')
  const [editingTitle, setEditingTitle] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(isNew ? null : documentId)
  // Track whether we've hydrated from the live query yet
  const [hydrated, setHydrated] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Placeholder.configure({ placeholder: 'Start writing…' }),
      CharacterCount,
    ],
    content: '',
    editorProps: {
      attributes: { class: proseClassName },
    },
  })

  // Once the live query resolves and we have real document data, hydrate the
  // editor and title. This runs once — `hydrated` prevents overwriting edits
  // the user has made after the initial load.
  useEffect(() => {
    if (hydrated || !isReady) return
    if (isNew) {
      setHydrated(true)
      return
    }
    if (!document) return

    setTitle(document.title ?? 'Untitled document')
    if (editor && document.content) {
      // biome-ignore lint/suspicious/noExplicitAny: Prisma Json vs Tiptap Content mismatch
      editor.commands.setContent(document.content as any)
    }
    setHydrated(true)
  }, [isReady, document, editor, isNew, hydrated])

  const handleSave = useCallback(async () => {
    if (!editor) return
    setSaving(true)

    const content = editor.getJSON()
    const docTitle = title.trim() || 'Untitled document'
    const targetId = savedId ?? uuidv4()

    const result = await dbTransaction(() => {
      if (isNew || !savedId) {
        documentCollection.insert({
          id: targetId,
          title: docTitle,
          content,
          ownerId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      } else {
        documentCollection.update(savedId, (draft) => {
          draft.title = docTitle
          draft.content = content
          draft.updatedAt = new Date()
        })
      }
    })

    setSaving(false)

    if (result.isOk()) {
      toast.success('Document saved')
      if (isNew && !savedId) {
        setSavedId(targetId)
        navigate({ to: `/docs/${targetId}` })
      }
    } else {
      toast.error('Failed to save document')
    }
  }, [editor, title, isNew, savedId, user.id, navigate])

  const isOwned = isNew || document?.ownerId === user.id

  return (
    <Dashboard>
      <div className='flex flex-col grow h-1 bg-muted/30'>
        {/* Top action bar — sits below the Dashboard AppNav */}
        <div className='flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4 gap-2'>
          {/* Left: back + editable title + owner badge */}
          <div className='flex min-w-0 items-center gap-2'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    onClick={() => navigate({ to: '/docs' })}
                    aria-label='Back to documents'
                  >
                    <ArrowLeft />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Back to documents</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation='vertical' className='h-5' />

            {editingTitle ? (
              <input
                autoFocus
                className='w-64 rounded-md border border-ring bg-background px-2 py-1 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring/30'
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'Escape') setEditingTitle(false)
                }}
              />
            ) : (
              <button
                type='button'
                className='max-w-72 truncate rounded-md px-2 py-1 text-sm font-semibold text-foreground hover:bg-muted transition-colors'
                onClick={() => setEditingTitle(true)}
              >
                {title}
              </button>
            )}

            <Badge variant={isOwned ? 'default' : 'secondary'} className='shrink-0'>
              {isOwned ? 'Owned by you' : `Shared by ${getName(document?.owner)}`}
            </Badge>
          </div>

          {/* Right: share avatars + actions */}
          <div className='flex items-center gap-2 shrink-0'>
            {/* Shared-with avatars */}
            {(document?.shares ?? []).length > 0 && (
              <div className='flex items-center'>
                {(document?.shares ?? []).slice(0, 4).map(share => (
                  <TooltipProvider key={share.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className='-ml-2 h-6 w-6 border-2 border-background first:ml-0 ring-1 ring-border'>
                          <AvatarImage src={share.user?.image ?? ''} alt={getName(share.user)} />
                          <AvatarFallback className='text-[10px] font-bold bg-primary/10 text-primary'>
                            {getName(share.user).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>{getName(share.user)}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}

            {/* File upload */}
            <FileUploadButton editor={editor} />

            {/* Share */}
            {isOwned && savedId && <ShareDialog documentId={savedId} document={document} />}

            {/* Save */}
            <Button
              size='sm'
              onClick={handleSave}
              disabled={saving}
              className='shadow-xs transition-all hover:scale-[1.01] font-medium text-xs h-8 gap-1.5'
            >
              {saving ? <Loader2 className='animate-spin' /> : <Check />}
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Formatting toolbar */}
        <Toolbar editor={editor} />

        {/* Document canvas */}
        <div className='flex-1 overflow-y-auto px-6 py-10 pb-20'>
          <div className='relative mx-auto min-h-[680px] max-w-[816px] rounded-sm border border-border bg-card px-[88px] py-[72px] shadow-sm'>
            {/* Owner/shared color stripe */}
            <span
              aria-hidden
              className='absolute inset-y-0 left-0 w-1 rounded-l-sm'
              style={{ background: isOwned ? 'var(--primary)' : 'oklch(0.60 0.13 30)' }}
            />
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Status bar */}
        <StatusBar editor={editor} saving={saving} />
      </div>
    </Dashboard>
  )
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function Toolbar({ editor }: { editor: Editor | null }) {
  const isActive = useCallback(
    (name: string, attrs?: Record<string, unknown>) => editor?.isActive(name, attrs) ?? false,
    [editor],
  )

  if (!editor) return <div className='h-10 shrink-0 border-b border-border bg-background' />

  return (
    <div className='flex shrink-0 items-center gap-1 border-b border-border bg-background px-4 py-1.5'>
      <div className='flex items-center gap-0.5'>
        <ToolbarButton label='Paragraph' active={isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
          <Pilcrow size={15} />
        </ToolbarButton>
        <ToolbarButton label='Heading 1' active={isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <span className='text-[11px] font-bold'>H1</span>
        </ToolbarButton>
        <ToolbarButton label='Heading 2' active={isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <span className='text-[11px] font-bold'>H2</span>
        </ToolbarButton>
        <ToolbarButton label='Heading 3' active={isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <span className='text-[11px] font-bold'>H3</span>
        </ToolbarButton>
      </div>

      <Separator orientation='vertical' className='mx-1.5 h-4' />

      <div className='flex items-center gap-0.5'>
        <ToolbarButton label='Bold' active={isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton label='Italic' active={isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton label='Underline' active={isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={15} />
        </ToolbarButton>
      </div>

      <Separator orientation='vertical' className='mx-1.5 h-4' />

      <div className='flex items-center gap-0.5'>
        <ToolbarButton label='Bullet list' active={isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton label='Numbered list' active={isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={15} />
        </ToolbarButton>
      </div>
    </div>
  )
}

function ToolbarButton({
  children,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type='button'
      className={clsx(
        'inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
        active && 'bg-primary/10 text-primary hover:bg-primary/15',
      )}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Status bar
// ---------------------------------------------------------------------------

function StatusBar({ editor, saving }: { editor: Editor | null; saving: boolean }) {
  const words = editor?.storage.characterCount?.words?.() ?? 0
  const chars = editor?.storage.characterCount?.characters?.() ?? 0

  return (
    <footer className='flex h-7 shrink-0 items-center gap-4 border-t border-border bg-background px-4 text-xs text-muted-foreground'>
      <span className={clsx('inline-flex items-center gap-1.5 font-medium', saving ? 'text-muted-foreground' : 'text-chart-4')}>
        {saving ? <Loader2 size={12} className='animate-spin' /> : <Check size={12} />}
        {saving ? 'Saving…' : 'All changes saved'}
      </span>
      <span>{words} word{words !== 1 ? 's' : ''}</span>
      <span>{chars} character{chars !== 1 ? 's' : ''}</span>
    </footer>
  )
}

// ---------------------------------------------------------------------------
// File upload — imports .txt / .md into the editor
// ---------------------------------------------------------------------------

function FileUploadButton({ editor }: { editor: Editor | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !editor) return

      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!['txt', 'md'].includes(ext ?? '')) {
        toast.error('Only .txt and .md files are supported')
        return
      }

      const text = await file.text()

      // Convert plain text / basic markdown headings to HTML for Tiptap
      const html = text
        .split('\n')
        .map(line => {
          const trimmed = line.trim()
          if (!trimmed) return ''
          if (trimmed.startsWith('### ')) return `<h3>${trimmed.slice(4)}</h3>`
          if (trimmed.startsWith('## ')) return `<h2>${trimmed.slice(3)}</h2>`
          if (trimmed.startsWith('# ')) return `<h1>${trimmed.slice(2)}</h1>`
          return `<p>${trimmed}</p>`
        })
        .join('')

      editor.chain().focus().setContent(html).run()
      toast.success(`Imported "${file.name}"`)

      // Reset so the same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [editor],
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon-sm'
            onClick={() => fileInputRef.current?.click()}
            aria-label='Import file'
          >
            <FileUp />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Import .txt or .md file</TooltipContent>
      </Tooltip>
      <input
        ref={fileInputRef}
        type='file'
        accept='.txt,.md'
        className='hidden'
        onChange={handleFileChange}
      />
    </TooltipProvider>
  )
}

// ---------------------------------------------------------------------------
// Share dialog — searchable multi-select user list with save/diff logic
// ---------------------------------------------------------------------------

function ShareDialog({ documentId, document }: { documentId: string; document: feDocument | undefined }) {
  const user = useStore(authStore, s => s.user)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  // IDs currently shared (from live data)
  const sharedIds = new Set((document?.shares ?? []).map(s => s.userId))

  // Local selection state: mirrors sharedIds when dialog opens, then tracks uncommitted picks
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Sync selection to live share state whenever the dialog opens or shares change
  useEffect(() => {
    if (open) setSelected(new Set(sharedIds))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, document?.shares?.length])

  // All users except the current owner
  const { data: allUsers } = useLiveQuery(
    q => q.from({ u: userCollection }).select(({ u }) => u),
    [],
  )

  const otherUsers = (allUsers ?? []).filter(u => u.id !== user.id)

  const filtered = search.trim()
    ? otherUsers.filter(u => {
        const q = search.toLowerCase()
        return (
          getName(u).toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
        )
      })
    : otherUsers

  const toggle = (userId: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const handleSave = useCallback(async () => {
    // Compute diff against the real saved state
    const toAdd = [...selected].filter(id => !sharedIds.has(id))
    const toRemove = [...sharedIds].filter(id => !selected.has(id))

    if (toAdd.length === 0 && toRemove.length === 0) {
      setOpen(false)
      return
    }

    setSaving(true)

    const result = await dbTransaction(() => {
      for (const userId of toAdd) {
        documentShareCollection.insert({
          id: uuidv4(),
          documentId,
          userId,
          createdAt: new Date(),
        })
      }
      for (const userId of toRemove) {
        const share = document?.shares?.find(s => s.userId === userId)
        if (share) documentShareCollection.delete(share.id)
      }
    })

    setSaving(false)

    if (result.isOk()) {
      const parts: string[] = []
      if (toAdd.length) parts.push(`${toAdd.length} added`)
      if (toRemove.length) parts.push(`${toRemove.length} removed`)
      toast.success(`Sharing updated — ${parts.join(', ')}`)
      setOpen(false)
    } else {
      toast.error('Failed to update sharing')
    }
  }, [selected, sharedIds, documentId, document?.shares])

  const selectedCount = selected.size

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size='sm'
          className='shadow-xs transition-all hover:scale-[1.01] font-medium text-xs h-8 gap-1.5'
        >
          <Share2 />
          Share
          {sharedIds.size > 0 && (
            <span className='ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-foreground/20 px-1 text-[10px] font-bold'>
              {sharedIds.size}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className='flex flex-col gap-0 p-0 sm:max-w-sm overflow-hidden'>
        {/* Header */}
        <DialogHeader className='px-4 pt-4 pb-3 border-b border-border'>
          <DialogTitle className='flex items-center gap-2 text-sm'>
            <Users size={15} />
            Share document
          </DialogTitle>
          <DialogDescription className='text-xs'>
            Select people to grant access. Changes apply when you save.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className='px-3 pt-3 pb-2'>
          <div className='relative'>
            <Search size={13} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none' />
            <Input
              autoFocus
              placeholder='Search by name or email…'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='h-7 pl-7 text-xs'
            />
          </div>
        </div>

        {/* User list */}
        <div className='flex-1 overflow-y-auto max-h-64 px-3 pb-2 flex flex-col gap-0.5'>
          {filtered.length === 0 && (
            <p className='text-xs text-muted-foreground text-center py-6'>
              {search ? 'No users match your search' : 'No other users found'}
            </p>
          )}

          {filtered.map(u => {
            const name = getName(u)
            const isSelected = selected.has(u.id)
            const wasShared = sharedIds.has(u.id)

            return (
              <button
                key={u.id}
                type='button'
                onClick={() => toggle(u.id)}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors',
                  isSelected
                    ? 'bg-primary/8 hover:bg-primary/12'
                    : 'hover:bg-muted',
                )}
              >
                {/* Checkbox indicator */}
                <span
                  className={clsx(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background',
                  )}
                >
                  {isSelected && <Check size={10} strokeWidth={3} />}
                </span>

                <Avatar className='h-7 w-7 shrink-0'>
                  <AvatarImage src={u.image ?? ''} alt={name} />
                  <AvatarFallback className='text-[10px] font-bold bg-primary/10 text-primary'>
                    {name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className='flex-1 min-w-0'>
                  <p className='text-xs font-medium truncate leading-tight'>{name}</p>
                  <p className='text-[10px] text-muted-foreground truncate'>{u.email}</p>
                </div>

                {/* Status pill */}
                {wasShared && !isSelected && (
                  <span className='shrink-0 text-[10px] text-destructive font-medium'>Remove</span>
                )}
                {!wasShared && isSelected && (
                  <span className='shrink-0 text-[10px] text-chart-4 font-medium'>Add</span>
                )}
                {wasShared && isSelected && (
                  <span className='shrink-0 text-[10px] text-muted-foreground'>Shared</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between gap-2 border-t border-border px-4 py-3'>
          <p className='text-[11px] text-muted-foreground'>
            {selectedCount === 0
              ? 'No one selected'
              : `${selectedCount} person${selectedCount !== 1 ? 's' : ''} selected`}
          </p>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button size='sm' onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className='animate-spin' /> : <Check />}
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
