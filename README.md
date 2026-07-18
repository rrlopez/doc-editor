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
- Docker (recommended for PostgreSQL)

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

### 3. Start PostgreSQL (Docker)

```bash
docker compose up -d db
```

Or point `POSTGRES_*` variables at an existing PostgreSQL instance.

### 4. Push schema and generate client

```bash
pnpm run db:push
pnpm run generate
```

### 5. Seed test users

```bash
pnpm run seed
```

When prompted, enter `y` to confirm. This seeds the `examples` folder by default.

### 6. Run the dev server

```bash
pnpm run dev
```

App is available at `http://localhost:3000`.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `CANONICAL_URL` | Public-facing base URL | `http://localhost:3200` |
| `BETTER_AUTH_URL` | Auth base URL (same as canonical) | `http://localhost:3200` |
| `BETTER_AUTH_INTERNAL_URL` | Internal server-to-server auth URL | `http://127.0.0.1:3000` |
| `BETTER_AUTH_SECRET` | Secret key for auth signing | any random string |
| `POSTGRES_HOST` | PostgreSQL host | `localhost` |
| `POSTGRES_PORT` | PostgreSQL port (internal) | `5432` |
| `POSTGRES_USER` | Database username | `root` |
| `POSTGRES_PASSWORD` | Database password | `password` |
| `POSTGRES_DB` | Database name | `doc-editor` |

See `.env.example` for the full list including Docker-specific variables.

---

## Running Locally (Docker — Recommended)

```bash
pnpm run docker:dev
```

This builds the image, pushes the schema, and starts the dev server with hot reload.

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
