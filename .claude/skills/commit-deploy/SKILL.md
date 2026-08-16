---
name: commit-deploy
description: Git commit all changes then deploy to Vercel (frontend) and Railway (backend). Use when user says "commit แล้ว deploy", "push ขึ้น production", or "อัปเดตเว็บด้วย".
disable-model-invocation: true
argument-hint: "commit message"
---

Commit current changes and deploy AuraMatch to production.

## Step 1 — Review changes
```bash
cd "/Users/saridbutchuang/Desktop/RMWEB09/auramatch ver3" && git status && git diff --stat
```

## Step 2 — Stage and commit
Use the provided commit message `$ARGUMENTS`, or generate one from the diff.
```bash
cd "/Users/saridbutchuang/Desktop/RMWEB09/auramatch ver3" && git add -A && git commit -m "$ARGUMENTS"
```

## Step 3 — Deploy frontend to Vercel
```bash
cd "/Users/saridbutchuang/Desktop/RMWEB09/auramatch ver3" && npm run build && vercel --prod
```
Fix any build errors before proceeding.

## Step 4 — Deploy backend to Railway
Check login first:
```bash
railway status
```
If unauthorized, tell user: **run `! railway login` in the terminal**.

If logged in:
```bash
cd /Users/saridbutchuang/Desktop/RMWEB09/backend_auramatch && railway up
```

## Notes
- `VITE_*` env vars must be set in **Vercel dashboard** — not just local `.env`
- Backend `GEMINI_API_KEY` and `GEMINI_IMAGE_MODEL` must be set in Railway dashboard or via `railway variables set KEY=value`
- Do NOT commit `.env` files or `gemini-key.json`
