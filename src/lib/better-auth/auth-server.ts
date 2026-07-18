import { createServerFn } from '@tanstack/react-start'
import type { Prisma } from 'prisma/generated/prisma/client'
import { prisma } from '../prisma-client'
import { auth } from './auth'
import { authMiddleware } from './auth-middleware'

// Derive core entity payloads directly from Prisma Client models
type DBUser = Prisma.UserGetPayload<{ select: { id: true; firstName: true; lastName: true; nickName: true; email: true; image: true } }>

export const getAuthUser = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.user?.id) return undefined

    const userId = context.user.id

    const [userData, sessionData] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, firstName: true, lastName: true, nickName: true, email: true, image: true },
      }) as Promise<DBUser | null>,
      prisma.session.findFirst({
        where: { userId: userId },
      }),
    ])

    if (!userData) {
      return undefined
    }

    const user = { ...userData, sessionId: sessionData?.id, assignedHotline: sessionData?.assignedHotline }
    return user
  })

export type ServerUser = NonNullable<Awaited<ReturnType<typeof getAuthUser>>>

export const verifyAuth = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    try {
      const response = await auth.api.signInEmail({
        body: {
          email: data.email,
          password: data.password,
        },
        asResponse: true, // Crucial: Prevents updating active session headers/cookies
      })

      if (!response.ok) {
        return { success: false, error: 'Invalid password.' }
      }

      const user = await prisma.user.findFirst({
        where: {
          email: data.email,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          nickName: true,
        },
      })

      if (!user) {
        return { success: false, error: 'User is not authorized.' }
      }

      // Return the information directly so you can use them dynamically in your UI
      return {
        success: true,
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          nickName: user.nickName,
        },
      }
    } catch (error) {
      console.error('verification error:', error)
      return { success: false, error: 'Internal verification failure.' }
    }
  })
