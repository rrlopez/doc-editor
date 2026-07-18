import { Store } from '@tanstack/react-store'
import type { ServerUser } from '@/lib/better-auth/auth-server'
import type { Prettify } from '@/lib/types'

const defaultValue = {
  isAuthenticated: false as boolean,
  isLoggingOut: false as boolean,
  isCreating: false as boolean,
  documentId: '' as string,
  user: {} as unknown as ServerUser,
}

export type AuthState = Prettify<typeof defaultValue | (Omit<typeof defaultValue, 'isAuthenticated'> & { isAuthenticated: true })>

export const authStore = new Store<AuthState>(defaultValue)

const SESSION_HOTLINE_KEY = 'cca-session-hotline'

function readSessionHotline(): string | undefined {
  if (typeof sessionStorage === 'undefined') return undefined
  return sessionStorage.getItem(SESSION_HOTLINE_KEY) ?? undefined
}

function withSessionHotline(user: ServerUser): ServerUser {
  const assignedHotline = readSessionHotline()
  return assignedHotline ? { ...user, assignedHotline } : { ...user, assignedHotline: undefined }
}

export function setSessionHotline(hotline: string): void {
  sessionStorage.setItem(SESSION_HOTLINE_KEY, hotline)
}

export function clearSessionHotline(): void {
  sessionStorage.removeItem(SESSION_HOTLINE_KEY)
}

export const userNeedsHotline = (user: ServerUser | undefined): boolean => {
  return Boolean(user?.id && !user.assignedHotline)
}

export const resetAuth = () => {
  authStore.setState(() => defaultValue)
}

export const setUser = (user: ServerUser) => {
  authStore.setState(state => {
    if (state.user.id) return state

    return user ? { ...state, isAuthenticated: true, user: withSessionHotline(user) } : defaultValue
  })
}

if (typeof window !== 'undefined') {
  authStore.subscribe(() => {
    const state = authStore.state
    localStorage.setItem('my-app-storage', JSON.stringify({ user: { id: state.user.id } }))
  })
}
