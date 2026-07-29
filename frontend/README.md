# HavensLight — Frontend

React (Vite) + Tailwind frontend for the India Solo Traveler Safety & Assistance Platform. Talks to the existing Express/Mongo backend over REST and Socket.io.

## Setup

```bash
npm install
cp .env.example .env   # then set VITE_API_URL to your backend's URL
npm run dev             # http://localhost:5173
```

Make sure the backend's `CLIENT_URL` env var matches wherever this frontend is running (http://localhost:5173 by default) — it's used for CORS and Socket.io.

## What's here

- **Auth**: `/login`, `/register` — JWT stored in localStorage, attached to every API call
- **Dashboard** (`/`): live overview of SOS status, upcoming check-ins, guardian circle
- **SOS** (`/sos`): one-tap trigger using the browser's Geolocation API, live location updates while active, resolve/false-alarm actions, alert history
- **Check-ins** (`/checkins`): schedule a "confirm safe by" time, confirm, see status (pending/confirmed/missed/escalated)
- **Contacts** (`/contacts`): full CRUD for the guardian circle, with priority ordering
- **Find a doctor** (`/doctors` inside the app, and `/find-a-doctor` publicly with no login) — mirrors the backend's deliberate no-auth doctor route

Real-time updates (SOS triggered/resolved, check-in escalated) arrive over Socket.io and refresh the relevant page automatically — see `src/context/SocketContext.jsx`.

## Structure

Organized by concern rather than by feature-module (unlike the backend), since the frontend is small enough that page-per-route is clearer:

```
src/
  api/            axios client + one function per backend endpoint
  context/        AuthContext (JWT/user state), SocketContext (realtime)
  components/
    layout/       AppShell (sidebar), AuthLayout, PublicLayout, ProtectedRoute
    ui/           Button, Card, Field/Input/Select, Badge, EmptyState, SignalRing
  pages/          one file per route
  constants/      Indian states + the 22 scheduled languages (shared by Register + Doctors)
```

Adding a future feature (guardian network, Explore/Stay/Dine) means a new page + a new set of functions in `api/endpoints.js` — no changes needed to existing pages.
