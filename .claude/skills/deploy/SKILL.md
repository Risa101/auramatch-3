---
name: deploy
description: Deploy AuraMatch frontend to Vercel and/or backend to Railway. Use when the user says "deploy", "push to production", or "อัปเดตเว็บ".
disable-model-invocation: true
argument-hint: "frontend|backend|all"
---

Deploy AuraMatch to production. Argument: `$ARGUMENTS` (frontend | backend | all — default: all).

## Steps

### Frontend (Vercel)
1. Run `npm run build` in `/Users/saridbutchuang/Desktop/RMWEB09/auramatch ver3/` — fix any build errors before proceeding.
2. Deploy: `vercel --prod` from the same directory.
3. Confirm the deployment URL matches `https://auramatch-ver3.vercel.app` (or current alias).

### Backend (Railway)
1. Confirm `backend_auramatch/.env` has correct `GEMINI_API_KEY`, `GEMINI_IMAGE_MODEL=gemini-2.5-flash-image`, and Railway MySQL variables.
2. Check Railway login: `railway status` — if unauthorized, tell the user to run `! railway login`.
3. Push: `cd /Users/saridbutchuang/Desktop/RMWEB09/backend_auramatch && railway up`.
4. After deploy, set env vars if changed:
   ```
   railway variables set GEMINI_API_KEY=<key> GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
   ```

### Database (Railway MySQL)
Only needed when schema or data changes:
```
mysql -h caboose.proxy.rlwy.net -P 33764 -u root -pQlPVwKfwfqJsDWONvkLyDRkpikdqPJcJ railway < /path/to/dump.sql
```

## Notes
- Frontend uses Vite — `VITE_*` env vars must be set in Vercel dashboard, not just `.env`.
- Backend is Flask on Python 3.11 with `.venv` — Railway auto-detects via `Procfile` or `requirements.txt`.
- If Railway CLI is not logged in, the user must run `! railway login` interactively.
