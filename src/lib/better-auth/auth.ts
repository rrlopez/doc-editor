import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { prisma } from '../prisma-client'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL: {
    allowedHosts: [process.env['BETTER_AUTH_URL']!, process.env['BETTER_AUTH_INTERNAL_URL']!, '*.vercel.app'].filter(Boolean),
    protocol: process.env['NODE_ENV'] === 'development' ? 'http' : 'https',
  },
  secret: process.env['BETTER_AUTH_SECRET'],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
      },
      sessionId: { type: 'string', required: true },
      assignedHotline: { type: 'string', required: false },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async session => {
          const membership = await prisma.user.findFirst({
            where: { id: session.userId },
          })

          if (membership) {
            return {
              data: session,
            }
          }

          return { data: session }
        },
      },
    },
  },
  plugins: [tanstackStartCookies()],
})

export type Session = typeof auth.$Infer.Session
