# Submission

**Candidate:** Ricardo Rey Crisanto V. Lopez II
**Email:** ricardoreylopez06@gmail.com
**Assignment:** Ajaia LLC — AI-Native Full Stack Developer

---

## Deliverables

| Item | Link |
|---|---|
| Live Demo | https://doc-editor-sage.vercel.app |
| Source Code | https://github.com/rrlopez/doc-editor |
| Walkthrough Video | https://www.loom.com/share/16362b6c1b5549d4b1d6dbd03ce94865 |

---

## Test Credentials

| User | Email | Password |
|---|---|---|
| Alice Johnson | `alice@doc-editor.com` | `123qwe123!1` |
| Bob Smith | `bob@doc-editor.com` | `123qwe123!1` |
| Charlie Brown | `charlie@doc-editor.com` | `123qwe123!1` |

To review the sharing flow: log in as **Alice**, create a document, open the Share dialog, select **Bob**, and save. Log out and log in as **Bob** — the document appears in his dashboard with a "Shared with you" badge.

---

## Features Completed

- [x] Email/password login
- [x] Create a new document
- [x] Rename a document (inline editable title)
- [x] Rich text editing — bold, italic, underline, H1/H2/H3, bullet list, numbered list
- [x] Save document (manual save button + status bar)
- [x] Reopen saved documents (persisted to PostgreSQL, survives refresh)
- [x] File upload — import `.txt` or `.md` into the editor
- [x] Share document — searchable multi-select dialog, existing shares shown as pre-selected
- [x] Shared document access — shared docs appear in the recipient's dashboard
- [x] Owned vs. shared distinction — color-coded badge and stripe on each document
- [x] Pagination and search on the document list
- [x] Date range filter on the document list
- [x] Architecture note
- [x] AI workflow note

---

## Features Intentionally Omitted

**Real-time collaboration**
Two users can edit the same document but changes are not merged in real time. The last save wins. Implementing this would require a WebSocket or CRDT layer, which was out of scope for the timebox.

**Role-based sharing permissions**
All shares grant full edit access. Viewer-only permissions were scoped out in favor of a working share flow.

**Email invitation for new users**
The share dialog only works with existing accounts. Inviting users who haven't registered was deprioritized.

**Rich markdown parsing on import**
Import handles headings and paragraphs. Inline formatting (bold `**`, lists `-`) in `.md` files is imported as plain text rather than styled content.

**Automated feature tests**
The test suite contains a single Vitest runner smoke test. Feature-level tests were not written within the time constraint.

---

## What I Would Build With Another 2–4 Hours

1. **Real-time presence indicators** — show which users are currently viewing a document (WebSocket + a simple cursor/avatar overlay, without full CRDT)
2. **Export to Markdown** — serialize Tiptap JSON back to `.md` for download
3. **Document version history** — snapshot `content` on each save and allow reverting to a previous version
4. **Feature tests** — at least one Vitest + Testing Library test per core user action (create, save, share)

---

## Files Included

| File | Description |
|---|---|
| `README.md` | Setup, environment variables, run instructions, test credentials |
| `ARCHITECTURE.md` | Tech choices, schema, key decisions, tradeoffs |
| `AI_WORKFLOW.md` | AI tools used, what was accepted/rejected, verification process |
| `SUBMISSION.md` | This file — links, credentials, feature summary |
| `src/` | Full application source code |
| `prisma/` | Schema and seeders |
| `.env.example` | Environment variable template |
