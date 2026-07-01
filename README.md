# AutoWave Portal

React admin dashboard for AutoWave tenants — inbox, workflows, CRM, billing, and super-admin tools.

**Live:** https://app.autowave.playltp.in

## Stack

- Vite 8 + React 19
- Redux Toolkit (auth state)
- Tailwind CSS 4
- React Router 7

## Quick start

```bash
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api

npm install
npm run dev
```

Dev server: http://localhost:5173

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (production build) | API base URL including `/api` suffix |
| `VITE_BASE_PATH` | No | Subpath if app is not served from root |

**Production example:**

```
VITE_API_URL=https://api.autowave.playltp.in/api
```

`vite.config.js` fails production builds if `VITE_API_URL` is missing.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint |

## Production deploy

```bash
# Set env for build
export VITE_API_URL=https://api.autowave.playltp.in/api

npm ci
npm run build
# Deploy dist/ to app.autowave.playltp.in
```

Deploy **after** the API is updated — the portal depends on API routes and auth.

## Key routes

| Path | Access | Description |
|------|--------|-------------|
| `/login`, `/register` | Public | Auth |
| `/dashboard` | Tenant | Overview |
| `/inbox` | Tenant | WhatsApp/Instagram messages |
| `/workflows` | Tenant | Automation builder |
| `/leads` | Tenant | CRM leads from workflows |
| `/website-leads` | Super-admin only | Marketing demo leads |
| `/admin` | Super-admin | Platform management |
| `/career-ai` | CareerAI tenants | Resume/job matching vertical |

Session validation runs once in `ProtectedRoute` via `/auth/profile` — not duplicated in the dashboard layout.

## Forgot password

The forgot-password flow is not implemented on the backend. The UI link and route were removed until SMTP-based reset is built.
