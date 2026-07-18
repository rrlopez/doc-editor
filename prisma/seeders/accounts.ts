// fallow-ignore-file unused-file
/** biome-ignore-all lint/suspicious/noExplicitAny: TODO: explain */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { hashPassword } from 'better-auth/crypto'
import Papa from 'papaparse'
import type { PrismaClient } from 'prisma/generated/prisma/client'

export const order = 0

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface AccountSeedUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  nickName: string | null
  image: string | null
}

interface AccountsSeedData {
  users: AccountSeedUser[]
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  const firstName = parts[0] || null
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : null
  const nickName = firstName

  return { firstName, lastName, nickName }
}

function parseAccountNames(row: Record<string, string | undefined>) {
  const firstName = row['user_first_name']?.trim() || null
  const lastName = row['user_last_name']?.trim() || null
  const nickName = row['user_nickname']?.trim() || null
  const fullName = row['user_name']?.trim() || ''

  if (firstName || lastName) {
    return {
      firstName,
      lastName,
      nickName: nickName || firstName,
    }
  }

  if (nickName) {
    return {
      firstName: nickName,
      lastName: null,
      nickName,
    }
  }

  if (fullName) {
    return splitFullName(fullName)
  }

  return { firstName: null, lastName: null, nickName: null }
}

const DEFAULT_ACCOUNTS_DATA: AccountsSeedData = {
  users: [
    {
      id: 'user-1',
      email: 'user1@doc-editor.com',
      firstName: 'User1',
      lastName: 'User',
      nickName: 'User 1',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    },
    {
      id: 'user-2',
      email: 'user2@doc-editor.com',
      firstName: 'User2',
      lastName: '',
      nickName: 'User 2',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha',
    },
    {
      id: 'user-3',
      email: 'user3@doc-editor.com',
      firstName: 'User3',
      lastName: '',
      nickName: 'User 3',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    },
  ],
}

export function getAccounts(folderName: string): AccountsSeedData {
  let runtimeData: AccountsSeedData = { ...DEFAULT_ACCOUNTS_DATA }
  const resolvedCsvPath = path.join(__dirname, 'csv', folderName, 'accounts.csv')
  console.info('🔍 Target Account CSV Path:', resolvedCsvPath)

  if (fs.existsSync(resolvedCsvPath)) {
    console.info(`📈 Client CSV detected. Hydrating seed parameters from ${folderName}/accounts.csv...`)
    const fileContent = fs.readFileSync(resolvedCsvPath, 'utf-8')

    const { data, meta } = Papa.parse<Record<string, string>>(fileContent, {
      header: true,
      skipEmptyLines: true,
    })

    const requiredHeaders = ['user_email']
    const missingHeaders = requiredHeaders.filter(h => !meta.fields?.includes(h))
    if (missingHeaders.length > 0) {
      throw new Error(`❌ Ingestion aborted. Missing template columns: [${missingHeaders.join(', ')}]`)
    }

    if (data.length > 0) {
      runtimeData = {
        users: data.map(row => {
          const email = row['user_email']?.trim()

          if (!email) {
            throw new Error('❌ Ingestion aborted. Each row must include user_email.')
          }

          const computedNames = parseAccountNames(row)

          return {
            id: row['user_id']?.trim() || `usr-${crypto.randomUUID().slice(0, 8)}`,
            email,
            firstName: computedNames.firstName,
            lastName: computedNames.lastName,
            nickName: computedNames.nickName,
            image: row['user_image']?.trim() || null,
          }
        }),
      }
    }
  } else {
    throw new Error(`❌ Ingestion aborted. Target catalog dataset does not exist: "csv/${folderName}/accounts.csv"`)
  }

  return runtimeData
}

export async function Accounts(prisma: PrismaClient, options: { folder: string }) {
  const newPasswordHash = await hashPassword('123qwe123!1')
  const now = new Date()
  const runtimeData = getAccounts(options.folder)

  console.info(`👥 Processing ${runtimeData.users.length} associated tenant user profile maps...`)
  for (const u of runtimeData.users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        nickName: u.nickName,
        image: u.image,
        deletedAt: null,
        updatedAt: now,
      },
      create: {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        nickName: u.nickName,
        image: u.image,
        createdAt: now,
        updatedAt: now,
      },
    })

    const existingAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: 'credential' },
    })
    const credentialAccountId = existingAccount?.id ?? `acc-${user.id}`

    await prisma.account.upsert({
      where: { id: credentialAccountId },
      update: {
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: newPasswordHash,
        updatedAt: now,
      },
      create: {
        id: credentialAccountId,
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: newPasswordHash,
        createdAt: now,
        updatedAt: now,
      },
    })
  }

  console.info(`✅ Upserted ${runtimeData.users.length} user accounts.`)
}
