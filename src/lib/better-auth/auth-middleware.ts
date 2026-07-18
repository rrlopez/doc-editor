import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import type { Session } from './auth'
import { authClient } from './auth-client'

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: getRequest().headers,
    },
  })

  if (!session?.user) {
    return await next({
      context: { user: undefined as unknown as Session['user'] },
    })
  }

  const user = session?.user as Session['user']

  return await next({
    context: { user },
  })
})
