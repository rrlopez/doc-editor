// src/lib/auth-engine.ts

import { toast } from 'sonner'
import { localAuthCollection } from '@/db/local-auth'
import { clearModals } from '@/lib/overlay'
import { authStore, clearSessionHotline, resetAuth } from '@/store/auth-store'
import { authClient } from './auth-client'
import { getAuthUser, type ServerUser } from './auth-server'

export const AuthEngine = {
  /**
   * Syncs server session to local storage.
   */
  async syncServerToLocal(serverUser: ServerUser): Promise<void> {
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000
    const exists = localAuthCollection.has(serverUser.id)

    if (exists) {
      await localAuthCollection.update(serverUser.id, draft => {
        draft.profile = serverUser
        draft.expiresAt = expiry
      })
    } else {
      await localAuthCollection.insert({
        id: serverUser.id,
        email: serverUser.email,
        profile: serverUser,
        hashedPassword: '',
        expiresAt: expiry,
      })
    }
  },

  /**
   * Captures the password hash during a successful online login.
   */
  async loginOnline(email: string, password: string, onSuccess: (user: ServerUser) => void): Promise<void> {
    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: async () => {
          clearSessionHotline()

          const fullUser = await getAuthUser()
          if (!fullUser) {
            toast.error('Login succeeded but user profile could not be loaded.')
            return
          }

          const hashedPassword = await AuthEngine.hashCredentials(password)
          const localUser = [...localAuthCollection.values()].find(u => u.email === email)

          if (localUser) {
            await localAuthCollection.update(localUser.id, draft => {
              draft.profile = fullUser
              draft.hashedPassword = hashedPassword
              draft.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
            })
          } else {
            await localAuthCollection.insert({
              id: fullUser.id,
              email: fullUser.email,
              hashedPassword,
              profile: fullUser,
              expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
            })
          }

          onSuccess(fullUser)
        },
        onError: ctx => {
          toast.error(ctx.error.message || 'Authentication failed')
        },
      },
    )
  },

  /**
   * Type-safe offline login.
   */
  async loginOffline(email: string, password: string, onSuccess: (user: ServerUser) => void): Promise<void> {
    const localUser = [...localAuthCollection.values()].find(u => u.email === email)

    const inputHash = await AuthEngine.hashCredentials(password)

    if (localUser && localUser.hashedPassword === inputHash) {
      if (Date.now() > localUser.expiresAt) {
        toast.error('Offline session expired. Please connect to the internet.')
        return
      }

      clearSessionHotline()

      authStore.setState(s => ({
        ...s,
        user: { ...localUser.profile, assignedHotline: undefined },
        isAuthenticated: true,
      }))

      onSuccess(localUser.profile)
      return
    }

    toast.error('Invalid credentials or user not cached for offline use.')
  },

  /**
   * Performs a clean logout.
   * Clears the server session (if online) and wipes the local shadow.
   */
  async logout(params: { onSuccess: () => void }): Promise<void> {
    authStore.setState(state => ({ ...state, isLoggingOut: true }))
    clearModals()
    clearSessionHotline()
    resetAuth()

    try {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        await authClient.signOut({}, params)
      }
    } catch (error) {
      console.error('AuthEngine: Server signOut failed', error)
    }

    params.onSuccess()
  },

  hashCredentials: async (password: string) => {
    const msgBuffer = new TextEncoder().encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  },
}
