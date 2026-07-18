# Pre-Submission Review Checklist

Go through this before submitting the Google Drive folder.

---

## Deployment

- [ ] Live demo URL is accessible in a browser (not localhost)
- [ ] Login works with `alice@doc-editor.com` / `123qwe123!1`
- [ ] Creating a document works end to end
- [ ] Saving a document and refreshing shows the saved content
- [ ] Sharing a document and logging in as Bob shows it in Bob's dashboard

---

## Required Features

- [ ] Create a new document
- [ ] Rename a document
- [ ] Rich text: bold, italic, underline
- [ ] Rich text: at least one heading level
- [ ] Rich text: bulleted or numbered list
- [ ] Save and reopen (survives page refresh)
- [ ] File upload imports content into the editor
- [ ] Share dialog grants access to another user
- [ ] Shared document appears in the recipient's dashboard
- [ ] Owned vs. shared documents are visually distinct

---

## Submission Documents

- [ ] `README.md` — includes setup steps, environment variables, run instructions, test credentials
- [ ] `ARCHITECTURE.md` — tech choices, schema, key decisions, tradeoffs
- [ ] `AI_WORKFLOW.md` — tools used, what was accepted/rejected, verification method
- [ ] `SUBMISSION.md` — live URL, repo URL, video URL, credentials, feature summary, omissions

---

## Placeholders to Replace Before Submitting

- [ ] Replace `[PLACEHOLDER — add deployment URL]` in `README.md` with the actual live URL
- [ ] Replace `[PLACEHOLDER — add deployment URL]` in `SUBMISSION.md` with the actual live URL
- [ ] Replace `[PLACEHOLDER — add video URL]` in `SUBMISSION.md` with the Loom/YouTube link

---

## Video

- [ ] Video is recorded (3–5 minutes)
- [ ] Video covers: login, create, edit, save, refresh, upload, share, cross-user verification
- [ ] Video is unlisted (Loom or YouTube)
- [ ] Video URL is added to `SUBMISSION.md`

---

## Google Drive Folder Contents

- [ ] Source code (zip or Drive link to repo)
- [ ] `README.md`
- [ ] `ARCHITECTURE.md`
- [ ] `AI_WORKFLOW.md`
- [ ] `SUBMISSION.md`
- [ ] Video URL (in `SUBMISSION.md` or a separate `VIDEO.txt`)
- [ ] No secrets committed (`.env` is in `.gitignore`, not in the repo)

---

## Final Sanity Check

- [ ] No `console.error` or uncaught exceptions visible in browser dev tools on the live URL
- [ ] Test credentials work on the live URL (not just locally)
- [ ] GitHub repo is public (or access has been granted to the reviewer)
