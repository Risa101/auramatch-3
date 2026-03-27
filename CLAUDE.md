# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AuraMatch** is a personal color analysis and beauty styling web app. Users upload a photo to discover their seasonal color palette (Spring/Summer/Autumn/Winter) and get personalized makeup, hair, and fashion recommendations.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR, port 5173)
npm run build     # Production build to /dist
npm run preview   # Preview built app locally
```

There are no test commands — this project has no test suite.

## Architecture

**Frontend:** React 18 + Vite (JavaScript/JSX, no TypeScript)
**Styling:** Tailwind CSS + Framer Motion + AOS
**Auth:** Firebase (email/password + social) with tokens stored in localStorage
**Backend:** Node.js API on Railway (`https://auramatch-backend-production.up.railway.app`)
**Database:** Firebase Firestore + backend DB
**Storage:** Firebase Cloud Storage
**AI:** Google Generative AI (Gemini) for photo transformation
**Deployment:** Vercel (frontend), Railway (backend)

### Request Flow

1. User authenticates via Firebase → token stored in `localStorage` as `auramatch:token`
2. All API calls go through `src/api/client.js` — an Axios instance that auto-injects `Bearer` token
3. On 401, auth state is cleared and `auth:changed` event is dispatched for cross-tab sync
4. Dev server proxies `/api/*`, `/admin/*`, `/products/*`, `/looks/*`, etc. → `http://127.0.0.1:5010`

### Key Directories

| Path | Purpose |
|------|---------|
| `src/pages/` | Lazy-loaded page components (all routes) |
| `src/pages/admin/` | Admin-only pages (`SalesDashboard.jsx`, `ProductManagement.jsx`) |
| `src/components/` | Reusable UI (Navbar, Footer, MakeoverStudio, route guards) |
| `src/callapi/` | API service functions (`call_api_user.jsx`, `call_api_admin.jsx`, etc.) |
| `src/lib/` | Firebase init, auth helpers, localStorage session, i18n config |
| `src/data/` | Static data: color palettes, product DB, face shapes |
| `src/utils/` | Helper functions for storage, likes, analysis history, coupons |
| `public/overlays/` | Makeup overlay images for MakeoverStudio |

### Routing & Guards

- **Public:** `/`, `/login`, `/register`, `/looks`, `/advisor`, `/about`
- **Auth-protected:** `/analysis`, `/account`, `/history` — guarded by `RequireAuth` in `RouteGuards.jsx`
- **Admin-only:** `/admin/*` — guarded by `RequireAdmin.jsx` (checks Firebase + backend admin flag)
- All pages use `React.lazy()` with a Suspense fallback showing "AuraMatch Atelier..."

### Auth State Shape (localStorage)

```
auramatch:isLoggedIn  → boolean
auramatch:user        → JSON { uid, email, name, photoURL }
auramatch:token       → Bearer token string
auramatch:isAdmin     → boolean
```

### Color System

Four seasonal palettes defined in `src/data/personalColors.js`. Brand colors:
- Primary: `#D23669` (rose)
- Gold: `#C5A358`
- Base: `#FDFCFB`

### i18n

Supports Thai (`th`) and English (`en`) via `react-i18next`. Default fallback is Thai. Use `useTranslation()` hook in components.

## Environment Variables

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

VITE_API_URL=http://127.0.0.1:5010
VITE_API_BASE_URL=https://auramatch-backend-production.up.railway.app

VITE_ADMIN_EMAILS=
VITE_ADMIN_PASSWORD=
VITE_GEMINI_PROMPT=
```
