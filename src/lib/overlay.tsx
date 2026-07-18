/** biome-ignore-all lint/suspicious/noExplicitAny: allowing any type for flexibility */
import moment from 'dayjs'
import { Component, useEffect, useRef } from 'react'
import { v4 as uuid } from 'uuid'

type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never

export type OverlayProps = {
  open: boolean
  onClose: () => void
}

type IOptions<T> = {
  key?: string
} & Omit<T, 'onYes'> &
  (
    | {
        activeKey?: undefined
      }
    | {
        activeKey: string
        onYes: (props: IComponentProps<T>) => void
      }
  )

type IComponentProps<T> = OverlayProps & T
interface IDialogProps<T = any> {
  key: string | undefined
  id: string
  open: boolean
  props: Omit<IComponentProps<T>, 'open' | 'onClose'>
  Component: React.FC<IComponentProps<T>>
}
interface IOverlayState {
  dialogs: IDialogProps[]
  isMounted: boolean
}
type IOverlayProps = object

// ==========================================
// ANTI-TAMPER WRAPPER COMPONENT
// ==========================================
function SafeDialogGuard({ id, children, onTamper }: { id: string; children: React.ReactNode; onTamper: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        // 1. Detect if the container shell itself or its child modal gets deleted from the DOM tree
        if (mutation.removedNodes.length > 0) {
          const wasRemoved = Array.from(mutation.removedNodes).some(node => {
            if (!(node instanceof HTMLElement)) return false

            // Check if the removed node is the guard container itself, the modal element,
            // or if the modal element was tucked inside the removed node hierarchy.
            return node.id === `guard-${id}` || node.id === id || node.contains(document.getElementById(id))
          })

          if (wasRemoved) {
            onTamper()
            break
          }
        }

        // 2. Detect if someone changes the style attributes (e.g., adding display: none, opacity: 0)
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement
          // Only trigger if they are tampering with our guard container or the modal inner element
          if (target.id === `guard-${id}` || target.id === id) {
            const style = window.getComputedStyle(target)
            if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
              onTamper()
              break
            }
          }
        }
      }
    })

    // Start tracking the document layout body
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    })

    return () => observer.disconnect()
  }, [id, onTamper])

  return (
    <div id={`guard-${id}`} ref={containerRef} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}

// ==========================================
// CORE OVERLAY CLASS
// ==========================================
class Overlay extends Component<IOverlayProps, IOverlayState> {
  static instance: Overlay | null = null

  constructor(props: IOverlayProps) {
    super(props)

    this.state = {
      dialogs: [],
      isMounted: false,
    }

    Overlay.instance = this
  }

  componentDidMount() {
    this.setState({ isMounted: true })

    // GLOBAL INTERACTION FALLBACK: If someone bypasses mutations but clicks the screen,
    // ensure any active dialog records that are missing their visual DOM nodes are remounted.
    window.addEventListener('click', this.handleGlobalInteraction, true)
    window.addEventListener('keydown', this.handleGlobalInteraction, true)
  }

  componentWillUnmount() {
    if (Overlay.instance === this) {
      Overlay.instance = null
    }
    window.removeEventListener('click', this.handleGlobalInteraction, true)
    window.removeEventListener('keydown', this.handleGlobalInteraction, true)
  }

  handleGlobalInteraction = () => {
    const activeDialogs = this.state.dialogs.filter(d => d.open)

    for (const dialog of activeDialogs) {
      const domNode = document.getElementById(`guard-${dialog.id}`)
      if (!domNode) {
        console.warn(`[Overlay Guard] Modal DOM shell missing during user interaction. Remounting ${dialog.id}`)
        this.forceRemountDialog(dialog.id)
      }
    }
  }

  forceRemountDialog(id: string) {
    this.setState(state => {
      const updatedDialogs = state.dialogs.map(dialog => {
        if (dialog.id === id) {
          // Temporarily generate a tiny key variance to break the React reconciliation cache
          // and force an absolute clean layout re-render of the node tree
          return { ...dialog, id: `${id.split('-')[0]}-${uuid().split('-')[0]}` }
        }
        return dialog
      })
      return { dialogs: updatedDialogs }
    })
  }

  showDialog<T extends React.FC<ComponentProps<T>>>(Component: T, options?: IOptions<Omit<ComponentProps<T>, 'open' | 'onClose'>>): string {
    const id = uuid().split('-')[0] || ''
    const { key, ...props } = options || {}

    const [...dialogs] = this.state.dialogs.filter(({ key, open }) => open || key)

    const dialogIndex = dialogs.findIndex(dialog => dialog.key && dialog.key === key)

    if (dialogIndex > -1) {
      const dialog = dialogs.splice(dialogIndex, 1)[0]
      if (dialog) dialogs.push({ ...dialog, open: true, props })
    } else dialogs.push({ Component, props, open: true, key, id })

    this.setState({ dialogs })

    return id
  }

  delDueToBackButton(id: string): string {
    this.setState(state => {
      const dialog = state.dialogs.find(dialog => dialog.id === id)
      if (dialog) dialog.open = false
      return { ...state }
    })

    return id
  }

  delDialog(id: string): string {
    return this.delDueToBackButton(id)
  }

  clear(): void {
    const dialogs = this.state.dialogs.map(dialog => ({
      ...dialog,
      open: false,
      key: undefined,
    }))

    this.setState({ dialogs })
  }

  deleteChildDialog(id: string): void {
    const startIndex = this.state.dialogs.findIndex((dialog: IDialogProps) => id === dialog.id)
    const dialogs = this.state.dialogs.map((dialog, i: number) => {
      if (i > startIndex) return { ...dialog, open: false, key: undefined }
      return dialog
    })

    this.setState({ dialogs })
  }

  render() {
    return this.state.dialogs.map(({ Component, open, props, id }) => {
      if (!open) return null

      return (
        <SafeDialogGuard key={id} id={id} onTamper={() => this.forceRemountDialog(id)}>
          <Component {...props} open={open} onClose={() => this.delDialog(id)} />
        </SafeDialogGuard>
      )
    })
  }
}

export const showModal = async <T extends React.FC<ComponentProps<T>>>(
  Component: T,
  options?: IOptions<Omit<ComponentProps<T>, 'open' | 'onClose'>>,
): Promise<string> => {
  const { activeKey, onYes }: any = options || {}

  if (activeKey) {
    const expiration: { value: string } = JSON.parse(localStorage.getItem(activeKey) || '{}')
    if (moment(new Date(expiration.value)).isAfter(moment(new Date()))) {
      await onYes?.({ ...options, open: true, onClose: () => {} })
      return ''
    }
    localStorage.removeItem(activeKey)
  }

  if (!Overlay.instance) {
    console.error('Overlay instance not found. Make sure <Overlay /> is mounted in your App root.')
    return ''
  }

  return Overlay.instance.showDialog(Component, options)
}
export const delModal = (id: string) => Overlay.instance?.delDialog(id)
export const clearModals = () => Overlay.instance?.clear()
export const delChildModals = (id: string) => Overlay.instance?.deleteChildDialog(id)

export default Overlay
