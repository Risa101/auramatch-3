---
name: update-env
description: Update environment variables in local .env files and Railway. Use when user gets new API key, changes DB password, or says "เปลี่ยน key", "อัปเดต env".
disable-model-invocation: true
argument-hint: "KEY=value"
---

Update environment variable `$ARGUMENTS` in both local and Railway.

## Local backend (.env)
File: `/Users/saridbutchuang/Desktop/RMWEB09/backend_auramatch/.env`

Read the current file, then use Edit tool to update the specific key. Never overwrite the whole file.

## Local frontend (.env)
File: `/Users/saridbutchuang/Desktop/RMWEB09/auramatch ver3/.env`

`VITE_*` prefix required for Vite to expose vars to the browser.

## Railway (backend)
```bash
railway variables set $ARGUMENTS
```
If not logged in, tell user to run `! railway login` first.

## Vercel (frontend)
Vercel env vars must be set via dashboard or CLI:
```bash
vercel env add VITE_KEY_NAME production
```
Then redeploy: `vercel --prod`

## Key variables reference

### Backend (`backend_auramatch/.env`)
| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key (starts with AIza...) |
| `GEMINI_IMAGE_MODEL` | Image generation model (currently `gemini-2.5-flash-image`) |
| `GEMINI_SERVICE_ACCOUNT` | Leave empty — use API key auth |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASS` / `DB_NAME` | Local MySQL (XAMPP) |

### Frontend (`auramatch ver3/.env`)
| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Local backend URL (`http://127.0.0.1:5010`) |
| `VITE_API_BASE_URL` | Production backend URL (Railway) |
| `VITE_GEMINI_PROMPT` | Custom prompt for Gemini image generation |
| `VITE_FIREBASE_*` | Firebase configuration |

## After updating
- Restart local backend: kill existing process and re-run `.venv/bin/python3 app.py`
- Frontend picks up `.env` changes automatically via Vite HMR
- Railway redeploys automatically after `railway variables set`
