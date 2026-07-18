# AI Workflow

**Project:** Doc Editor
**Author:** Ricardo Rey Crisanto V. Lopez II

---

## AI Tools Used

| Tool | Role |
|---|---|
| **Kiro** | Primary agentic coding assistant — used for implementation tasks end-to-end |
| **ChatGPT** | Prompt generation and exploring approach options before implementation |
| **Gemini** | Small bug fixes and quick syntax lookups |

---

## Where AI Materially Accelerated Development

**Editor page rewrite**
The document editor page (`$documentId/index.tsx`) required integrating five separate concerns: the Tiptap editor, a custom toolbar, save logic using TanStack DB transactions, a file upload handler, and a share dialog. Kiro scaffolded all of this in a single pass, following the existing project's design tokens and component library rather than introducing new patterns.

**Query layer fix for shared documents**
The `fetchDocs` query originally only returned owned documents. Extending it to include shared documents required understanding TanStack DB's join API constraints (single equality per join condition). Kiro identified the correct approach — join on `documentId`, filter on `userId` in `where` — after the first attempt using `and(eq(), eq())` in the join condition was rejected at runtime.

**Submission document drafting**
All submission artifacts (README, ARCHITECTURE, this file, SUBMISSION) were drafted by Kiro based on the actual codebase — reading schema files, seeders, environment examples, and implementation code rather than relying on described features.

**Column definitions**
The document list table columns (title, owner avatar, shared badge, created date, last edited) were generated quickly with correct TanStack Table accessor patterns and the project's existing `Badge`, `Avatar`, and `dayjs` utilities.

---

## AI Suggestions I Rejected or Modified

**`insertMutation` / `updateMutation` / `deleteMutation` imports**
Kiro initially imported these from `@tanstack/react-db`. They do not exist as named exports. I identified the error from the TypeScript output and directed Kiro to use the correct collection methods (`collection.insert()`, `collection.update()`, `collection.delete()`) called inside a `dbTransaction` callback — which matches the pattern the existing `local-db-transaction.ts` utility was designed for.

**`and(eq(), eq())` in join condition**
Kiro's first implementation of the shared-documents query used a compound expression in the join `ON` clause. This produced a runtime error ("Join condition must be an equality expression"). I reported the error and Kiro correctly moved the second condition into a `.where()` clause.

**Dynamic `require()` for `deleteMutation`**
An earlier draft of the share removal logic used `require('@tanstack/react-db')` at runtime to access a mutation helper. I rejected this — it bypasses the module system and fails in ESM. Kiro replaced it with a proper static import of the collection's `.delete()` method.

**Hardcoded hex colors in the editor**
The initial editor page used hardcoded hex values (`#f6f5f3`, `#2f5d9f`, etc.) instead of the project's CSS design tokens. I instructed Kiro to use `var(--primary)`, `text-foreground`, `bg-background`, and other token classes to match the existing design system.

---

## How I Verified Correctness

- **TypeScript** — ran `pnpm exec tsc --noEmit` after each significant change and confirmed errors dropped to zero in modified files
- **Runtime testing** — loaded the app in the browser and exercised each feature manually (create document, save, refresh, upload file, share with another user, verify shared doc appears in dashboard)
- **Cross-user sharing flow** — logged in as Alice, shared a document with Bob, logged in as Bob, confirmed the document appeared with the "Shared with you" indicator
- **Error messages** — runtime errors (join condition error, missing exports) were used as direct feedback to correct AI output rather than accepted as final

---

## Overall AI Workflow

1. **Understand first** — before any implementation task, I read the relevant existing code to understand patterns, then described the task and constraints to the AI
2. **Delegate scaffolding** — used Kiro for generating boilerplate-heavy or repetitive code (columns, dialogs, form handlers)
3. **Review output** — checked every generated file for correctness: imports, type safety, adherence to existing patterns
4. **Fix with feedback** — when something failed (TS error, runtime error, wrong behavior), I reported the exact error to the AI rather than guessing and patching manually
5. **Verify end-to-end** — tested the actual user flow in the browser, not just the compile step

AI handled roughly 70% of the typing. The judgment on what to build, what to skip, and whether generated code was correct remained mine throughout.
