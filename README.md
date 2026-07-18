# Doc Editor

A lightweight collaborative document editor built as a full stack assessment project. Supports rich-text editing, document sharing, file import, and persistent storage.

**Author:** Ricardo Rey Crisanto V. Lopez II
**Live Demo:** doc-editor-sage.vercel.app
**Repository:** https://github.com/rrlopez/doc-editor

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (React SSR) |
| Language | TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui (Radix) |
| Rich Text | Tiptap v3 |
| Auth | Better Auth |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Client DB | TanStack DB + SQLite (OPFS) |
| Routing | TanStack Router |
| Server Functions | TanStack Start server functions |
| Testing | Vitest |

---

## Features

- **Authentication** — email/password login via Better Auth
- **Document creation** — create, rename, and edit documents
- **Rich text editor** — bold, italic, underline, headings (H1–H3), bullet and numbered lists
- **Save & reopen** — documents persist to PostgreSQL and survive page refresh
- **File import** — upload a `.txt` or `.md` file to populate editor content
- **Document sharing** — share a document with other users by selecting from a searchable list
- **Owned & shared dashboard** — table lists both documents you own and documents shared with you
- **Ownership indicators** — color-coded badges distinguish owned vs. shared documents

---

## Local Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- A running PostgreSQL instance (Docker is the easiest way — see step 3)

### 1. Clone and install

```bash
git clone https://github.com/rrlopez/doc-editor.git
cd doc-editor
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials. See [Environment Variables](#environment-variables) below.

### 3. Start PostgreSQL

The quickest way is Docker:

```bash
docker compose up -d db
```

Or point the `POSTGRES_*` variables in `.env` at any existing PostgreSQL instance. No other Docker setup is required to run the app locally.

### 4. Push schema and generate Prisma client

```bash
pnpm run generate
pnpm run db:push
```

> **Note:** Run `generate` before `db:push` — it compiles the Prisma client that the push script depends on.

### 5. Seed test users

```bash
pnpm run seed
```

When prompted, enter `y` to confirm. This seeds from the `examples` folder by default.

### 6. Run the dev server

```bash
pnpm run dev
```

App is available at `http://localhost:3000`.

---

## Environment Variables

| Variable | Description | Local value |
|---|---|---|
| `PORT` | Internal dev server port | `3000` |
| `PUBLIC_PORT` | Docker host-mapped port | `3200` |
| `CANONICAL_URL` | URL the browser hits — **`localhost:3000` locally, `localhost:3200` in Docker** | `http://localhost:3000` |
| `BETTER_AUTH_URL` | Must match `CANONICAL_URL` exactly | `http://localhost:3000` |
| `BETTER_AUTH_INTERNAL_URL` | Server-to-server auth URL (always the internal port) | `http://127.0.0.1:3000` |
| `BETTER_AUTH_SECRET` | Secret key for auth signing | any random string |
| `POSTGRES_HOST` | **`localhost` locally, `db` inside Docker Compose** | `localhost` |
| `POSTGRES_PORT` | PostgreSQL internal port | `5432` |
| `POSTGRES_HOST_PORT` | PostgreSQL Docker host-mapped port | `5433` |
| `POSTGRES_USER` | Database username | `root` |
| `POSTGRES_PASSWORD` | Database password | `password` |
| `POSTGRES_DB` | Database name | `doc-editor` |

See `.env.example` for the full list.

---

## Running Tests

```bash
pnpm run test
```

The project includes a Vitest smoke test confirming the test runner is configured correctly.

---

## Deployment

The project builds to a Nitro server bundle.

```bash
pnpm run build
pnpm run preview
```

For production, set `NODE_ENV=production` and ensure all environment variables are configured on the host.

---

## Test Credentials

These accounts are created by running `pnpm run seed`.

| Name | Email | Password |
|---|---|---|
| Alice Johnson | `alice@doc-editor.com` | `123qwe123!1` |
| Bob Smith | `bob@doc-editor.com` | `123qwe123!1` |
| Charlie Brown | `charlie@doc-editor.com` | `123qwe123!1` |

To demonstrate sharing: log in as Alice, create and share a document with Bob, then log in as Bob to verify it appears in his dashboard.

---

## Known Limitations

- File import supports only `.txt` and `.md`. `.docx` and other formats are not supported.
- Markdown import is basic — only heading syntax (`#`, `##`, `###`) and plain paragraphs are detected. Lists, bold, and other inline formatting in `.md` files are imported as plain text.
- The share dialog requires the recipient to already have an account. There is no email invitation flow.
- No real-time collaborative editing. Two users editing the same document simultaneously will overwrite each other's changes on save.
- The one automated test is a runner smoke test, not a feature test.
