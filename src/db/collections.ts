import type { Document, DocumentShare, Session, User } from 'prisma/generated/prisma/browser'
import { createSyncableCollection } from '.'

const SCHEMA_VERSION = 1

export const userCollection = createSyncableCollection<User>({
  apiKey: 'user',
  schemaVersion: SCHEMA_VERSION,
  syncMode: 'eager',
})

export const sessionCollection = createSyncableCollection<Session>({
  apiKey: 'session',
  schemaVersion: SCHEMA_VERSION,
  syncMode: 'on-demand',
})

export const documentCollection = createSyncableCollection<Document>({
  apiKey: 'document',
  schemaVersion: SCHEMA_VERSION,
  syncMode: 'on-demand',
})

export const documentShareCollection = createSyncableCollection<DocumentShare>({
  apiKey: 'documentShare',
  schemaVersion: SCHEMA_VERSION,
  syncMode: 'on-demand',
})
