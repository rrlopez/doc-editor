# Architecture

**Project:** Doc Editor
**Author:** Ricardo Rey Crisanto V. Lopez II

---

## High-Level Architecture

```
Browser
  │
  ├── TanStack Router (file-based, client-side routing)
  ├── TanStack DB (local SQLite via OPFS — optimistic client cache)
  │     └── BroadcastChannel (cross-tab sync)
  │
  ▼
TanStack Start (React SSR framework)
  │
  ├── Server Functions (createServerFn)
  │     ├── crudAPI     — generic Prisma proxy (findMany, create, update, delete)
  │     └── transactionAPI — batched multi-op Prisma transactions
  │
  ▼
Prisma ORM → PostgreSQL
```

The app uses a **local-first pattern**: TanStack DB maintains a SQLite database in the browser's Origin Private File System (OPFS) as an optimistic cache. Writes go to the local cache immediately, then sync to the server via server functions. Reads are served from the local cache, making the UI feel instant.

---

## Technology Choices

**TanStack Start** was chosen as the framework because it provides React SSR with file-based routing, server functions, and first-class TanStack ecosystem integration. It avoids the overhead of a separate API server.

**TanStack DB** provides the local-first query layer. Documents and shares are queried using a reactive live query system. This means the document list and share state update without manual cache invalidation.

**Tiptap** is the rich text editor. It runs on ProseMirror and outputs JSON (stored as Prisma `Json` in PostgreSQL), which allows structured serialization and re-hydration.

**Better Auth** handles authentication with credential-based login. Sessions are server-managed and checked via middleware on all server functions.

**Prisma** provides type-safe database access. A generic `crudAPI` proxy and a `transactionAPI` batch endpoint eliminate the need for per-model API routes.

---

## Database Schema Summary

```
User
  id, email, firstName, lastName, nickName, image

Session / Account
  Standard Better Auth session and credential tables

Document
  id, title, content (Json), ownerId → User

DocumentShare
  id, documentId → Document, userId → User
  UNIQUE(documentId, userId)
```

`Document.content` stores the Tiptap editor JSON blob. This preserves formatting exactly, at the cost of making the field opaque to SQL queries.

---

## Key Engineering Decisions

**Generic CRUD proxy over per-model routes**
A single `crudAPI` server function accepts `{ table, action, args }` and proxies to the matching Prisma delegate. This reduces boilerplate significantly. The tradeoff is that it requires trust in the auth middleware to gate access — there is no per-field authorization logic.

**Local-first with TanStack DB**
All reads come from the local SQLite cache. Writes are optimistic — they appear immediately in the UI and then confirm (or roll back) after the server responds. This makes the editing experience feel fast but adds complexity: the collection sync layer must be kept in sync after manual transactions.

**Diff-based share updates**
The share dialog computes a diff (`toAdd`, `toRemove`) against the current live share state and applies all changes in a single `dbTransaction`. This means re-saving with no changes is a no-op.

**File-based routing**
Routes live at `src/routes/(private)/docs/` and `src/routes/(private)/docs/$documentId/`. The `(private)` group runs an auth guard that redirects unauthenticated users to login. The route segment `create` is reserved — navigating to `/docs/create` opens a blank new document.

---

## Tradeoffs

| Decision | Benefit | Cost |
|---|---|---|
| Generic crudAPI | Less boilerplate | No per-field authorization |
| Tiptap JSON storage | Exact formatting preserved | Content not queryable via SQL |
| Local-first (OPFS) | Instant UI, works offline partially | Sync complexity, OPFS not available in all environments |
| No real-time sync | Simpler architecture | Last writer wins on concurrent edits |
| Seeded test users | Easy reviewer demo | Users must exist before sharing works |

---

## Future Improvements

- **Real-time collaboration** — WebSocket or SSE layer on top of the existing transaction system
- **Role-based sharing** — viewer vs. editor permissions on `DocumentShare`
- **Email invitations** — allow sharing with users who don't have accounts yet
- **Rich markdown import** — use a proper markdown-to-ProseMirror parser (e.g. `prosemirror-markdown`)
- **Document version history** — store snapshots of `content` on each save
- **Export** — PDF or plain-text export from the Tiptap JSON
- **Full-text search** — index document content for search across body text, not just title
