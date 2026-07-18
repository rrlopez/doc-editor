# Walkthrough Video Script

**Target length:** 3–5 minutes
**Format:** Screen recording with voiceover

---

## [0:00 – 0:20] Introduction

> "Hi, I'm Ricardo. This is my submission for the Ajaia AI-Native Full Stack Developer assessment. I built a lightweight collaborative document editor using TanStack Start, React, TypeScript, Tiptap, Prisma, and PostgreSQL. I'll walk through the main user flow, the key decisions I made, and how I used AI in the process."

---

## [0:20 – 0:45] Login

*Show the login screen. Log in as Alice.*

> "The app uses email and password auth via Better Auth. I have three seeded users — Alice, Bob, and Charlie. I'll log in as Alice."

*Enter `alice@doc-editor.com` and `123qwe123!1`. Hit login.*

---

## [0:45 – 1:15] Dashboard — Document List

*Show the document list page.*

> "After logging in, Alice sees her document dashboard. The table shows documents she owns and documents that have been shared with her — we'll see that in a moment. There's a search bar, a date range filter, and a Create New Doc button. The columns show the title, owner, sharing status, creation date, and last edited time."

---

## [1:15 – 2:00] Create a Document and Edit

*Click Create New Doc.*

> "Clicking Create opens the editor. The page sits inside the same app shell as the dashboard — same navigation header, same design tokens."

*Type a title by clicking the title field and changing it.*

> "I can rename the document by clicking the title. It's inline editable."

*Type some content. Apply bold, a heading, and a bullet list.*

> "The toolbar supports bold, italic, underline, three heading levels, and both list types. These are all standard Tiptap extensions."

*Click Save.*

> "Hitting Save commits the document to PostgreSQL. A status bar at the bottom confirms the save. The word and character count updates live."

---

## [2:00 – 2:20] Refresh / Reopen

*Refresh the page.*

> "Refreshing the page reopens the document with the content fully intact — title, formatting, everything. Tiptap stores content as a JSON blob in the database, which means formatting survives serialization exactly."

---

## [2:20 – 2:40] File Import

*Click the upload icon in the top bar.*

> "The upload button lets me import a `.txt` or `.md` file. Basic markdown headings are detected and converted to Tiptap heading nodes. This replaces the current editor content."

*Select a `.txt` or `.md` file and show it loading into the editor.*

---

## [2:40 – 3:15] Sharing

*Click the Share button.*

> "The Share dialog shows all other users in the system. Existing shares come in pre-selected. I can search by name or email and select multiple people at once."

*Search for Bob, check his name, click Save changes.*

> "Clicking Save changes computes a diff — it only inserts or deletes the records that actually changed. I'll now log out and log in as Bob to verify."

*Log out, log in as Bob.*

> "Bob's dashboard now shows Alice's document with a 'Shared with you' badge. He can open and edit it, and his view shows the document is owned by Alice."

---

## [3:15 – 3:40] Architecture Summary

> "Architecturally, the app uses a local-first pattern. TanStack DB maintains a SQLite cache in the browser's OPFS, so reads are instant and the UI is optimistic. Writes sync to the server via TanStack Start server functions, which proxy to Prisma and PostgreSQL. There's no separate API server — server functions run in the same process."

---

## [3:40 – 4:10] AI Usage

> "I used Kiro as my primary agentic assistant for implementation — it handled scaffolding, the query layer, and most of the boilerplate. ChatGPT helped me think through approaches before writing code. Gemini was useful for quick syntax fixes."

> "I caught a few things AI got wrong: it tried to import mutation helpers that don't exist in the library, and used a compound expression in a join condition that the query builder doesn't support. Both errors surfaced as either TypeScript errors or runtime errors — I reported them back and got correct solutions quickly."

---

## [4:10 – 4:30] Scope Decisions

> "A few things I deliberately left out: real-time collaboration — the last save wins if two users edit simultaneously. Viewer-only sharing permissions — all shares are edit access. And rich markdown parsing on import — only headings are converted, inline formatting comes in as plain text."

> "With another two to four hours I'd add real-time presence indicators, document version history, and proper feature tests."

---

## [4:30 – 4:40] Close

> "Thanks for reviewing. The repo is at github.com/rrlopez/doc-editor and the live demo link is in the submission. Test credentials are in the README."
