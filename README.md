# HavensLight

**A haven, wherever the road takes you.**

A safety and trusted medical assistance platform for solo travelers across India — SOS alerts with live location sharing, scheduled check-ins with automatic escalation, an emergency contacts ("guardian circle") manager, and a doctor directory searchable by city, specialty, and the traveler's own language.

## Structure

```
backend/     Express + MongoDB API (feature-module architecture)
frontend/    React (Vite) + Tailwind client, mobile-first
```

Each has its own README with setup instructions. Quick start:

```bash
# backend
cd backend && npm install && cp .env.example .env && npm run dev

# frontend (separate terminal)
cd frontend && npm install && cp .env.example .env && npm run dev
```

See `PRODUCT_AND_BUSINESS_PLAN.md` for the original problem statement, market research, and MVP scope.

## Deployment

See the deployment guide shared alongside this repo for MongoDB Atlas + Render (backend) + Vercel (frontend) setup, and the PWA/Play Store packaging steps.
