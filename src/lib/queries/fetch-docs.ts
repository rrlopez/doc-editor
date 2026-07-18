import { and, count, eq, gte, type InitialQueryBuilder, ilike, lte, or, toArray, useLiveQuery } from '@tanstack/react-db'
import { useStore } from '@tanstack/react-store'
import { documentCollection, documentShareCollection, userCollection } from '@/db/collections'
import dayjs from '@/lib/dayjs'
import { authStore } from '@/store/auth-store'

interface fetchDocsOptions {
  page: number
  pageSize: number
  search?: string
  from: string | undefined
  to: string | undefined
}

/**
 * Base query that returns all documents visible to the current user:
 *   - documents they own, OR
 *   - documents shared with them via documentShare
 *
 * The approach: join documentShare as an optional (left) relation keyed on
 * the current user, then filter where ownerId = me OR share.userId = me.
 */
const baseQuery = (q: InitialQueryBuilder, options: fetchDocsOptions) => {
  const { search, from, to } = options
  const { user } = authStore.state

  return (
    q
      .from({ document: documentCollection })
      // Join the owner user record (for display)
      .leftJoin({ owner: userCollection }, ({ document, owner }) => eq(document.ownerId, owner.id))
      // Join share rows on documentId only (single equality — required by the query builder)
      .leftJoin(
        { myShare: documentShareCollection },
        ({ document, myShare }) => eq(myShare.documentId, document.id),
      )
      // Keep the row if the current user owns it OR the share row belongs to them
      .where(({ document, myShare }) =>
        or(
          eq(document.ownerId, user.id),
          eq(myShare.userId, user.id),
        ),
      )
      .where(({ document, owner }) => {
        // Title search + date range filters
        const searchFilter = search
          ? or(
              ilike(document.title, `%${search}%`),
              ilike(owner.firstName, `%${search}%`),
              ilike(owner.lastName, `%${search}%`),
            )
          : true

        return and(
          from ? gte(document.createdAt, dayjs(from).startOf('day').toDate()) : true,
          to ? lte(document.createdAt, dayjs(to).endOf('day').toDate()) : true,
          searchFilter,
        )
      })
  )
}

export const fetchDocs = (options: fetchDocsOptions) => {
  const { page, pageSize, search, from, to } = options

  const result = useLiveQuery(
    q =>
      baseQuery(q, options)
        .orderBy(({ document }) => document.createdAt, 'desc')
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .select(({ document, owner }) => ({
          ...document,
          owner,
          shares: toArray(
            q
              .from({ share: documentShareCollection })
              .leftJoin({ user: userCollection }, ({ share, user }) => eq(share.userId, user.id))
              .where(({ share }) => eq(share.documentId, document.id))
              .select(({ share, user }) => ({ ...share, user })),
          ),
        })),
    [page, pageSize, search, from, to],
  )

  return result
}

export const fetchDocumentCount = (options: fetchDocsOptions) => {
  const { page, pageSize, search, from, to } = options
  const assignedHotline = useStore(authStore, state => state.user?.assignedHotline)

  const result = useLiveQuery(
    q =>
      baseQuery(q, options).select(({ document }) => ({
        total: count(document.id),
      })),
    [page, pageSize, search, from, to, assignedHotline],
  )

  return Math.max(result.data?.[0]?.total ?? 0, 0)
}

export const fetchOneDocument = (documentId?: string | null) => {
  const assignedHotline = useStore(authStore, state => state.user?.assignedHotline)

  const result = useLiveQuery(
    q => {
      let query = q
        .from({ document: documentCollection })
        .leftJoin({ owner: userCollection }, ({ document, owner }) => eq(document.ownerId, owner.id))

      query = query.where(({ document }) => eq(document.id, documentId))

      return query.select(({ document, owner }) => ({
        ...document,
        owner,
        shares: toArray(
          q
            .from({ share: documentShareCollection })
            .leftJoin({ user: userCollection }, ({ share, user }) => eq(share.userId, user.id))
            .where(({ share }) => eq(share.documentId, document.id))
            .select(({ share, user }) => ({ ...share, user })),
        ),
      }))
    },
    [documentId, assignedHotline],
  )

  return result
}

type DocumentData = ReturnType<typeof fetchDocs>['data']
export type feDocument = NonNullable<DocumentData>[number]
