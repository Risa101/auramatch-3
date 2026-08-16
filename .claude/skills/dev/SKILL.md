---
name: dev
description: Start AuraMatch local development environment — both frontend (Vite) and backend (Flask). Use when the user says "run", "start", "เปิดเว็บ", or "รัน local".
disable-model-invocation: true
---

Start AuraMatch local development environment.

## Frontend (Vite — port 5173)
```bash
cd "/Users/saridbutchuang/Desktop/RMWEB09/auramatch ver3" && npm run dev
```

## Backend (Flask — port 5010)
```bash
cd /Users/saridbutchuang/Desktop/RMWEB09/backend_auramatch && .venv/bin/python3 app.py
```

## Color engine (auramatchgenz FastAPI — port 8010, optional)
Only needed for `POST /api/color-engine/analyze` (MediaPipe + CIELAB season/tone
analysis, proxied by `services/color_engine_service.py`). Without it running,
that one endpoint returns 503 — everything else works fine.
```bash
cd /Users/saridbutchuang/Desktop/auramatchgenz/backend && .venv/bin/uvicorn app.main:app --port 8010
```
Separate git repo/DB (its own local `auramatch.db` SQLite, not this project's MySQL) — not wired into deploy. Local-only until it's hosted somewhere for prod.

Run these in **separate terminals**. The Vite dev server proxies `/api/*`, `/admin/*`, `/products/*`, `/looks/*` → `http://127.0.0.1:5010`.

## Checklist before starting
- XAMPP MySQL is running (local DB on port 3306)
- `backend_auramatch/.env` has `GEMINI_API_KEY`, `DB_HOST=127.0.0.1`, `DB_NAME=auramatch`
- `auramatch ver3/.env` has `VITE_API_URL=http://127.0.0.1:5010`

## After starting
- Frontend: http://localhost:5173
- Backend health check: http://127.0.0.1:5010/api/health (if exists)
