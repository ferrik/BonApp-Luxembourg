# ARCHITECTURE.md

## Stack
Frontend:
- React
- Vite
- TypeScript
- Tailwind CSS if already configured

Backend:
- Node.js
- Express
- TypeScript

Database:
- PostgreSQL

Hosting target:
- Frontend: Vercel
- Backend: Render
- Database: Render PostgreSQL

## Architecture
Frontend Web/PWA -> REST API -> PostgreSQL

## Core backend endpoints
GET /api/health
GET /api/restaurants
GET /api/restaurants/:id
POST /api/restaurants
PATCH /api/restaurants/:id
POST /api/tracking/click

## Future endpoints - not required now
GET /api/admin/restaurants
PATCH /api/admin/restaurants/:id
GET /api/admin/analytics
GET /api/partners/:id/usage

Do not implement authentication yet.
Do not implement payment endpoints yet.

## Frontend pages
/
- home decision screen
- category buttons
- Surprise me

/results
- show max 3 restaurant cards
- category-driven results

/restaurants/:id
- restaurant detail page
- CTA buttons

/legal/terms
/legal/privacy
/legal/notice
/legal/partner-terms

/admin
- simple future admin page, not required in first UI flow unless requested

## Main UX rule
Do not build a generic long restaurant directory as the default experience.
Build a decision flow that helps the user choose quickly.

## Main backend rule
The database is the source of truth.
JSON import is used only to seed or update the database.
Manual admin edits should override imported data.

## Tracking model
restaurant_clicks stores raw events.
restaurant_usage_daily is reserved for future aggregation and billing-ready analytics.

## Monetization-ready architecture
The database may include:
- billing_enabled
- pricing_plan
- restaurant_usage_daily

But the application must not implement payments, invoices, Stripe, VAT, or subscription logic in MVP.

## Deployment notes
Use environment variables:
- DATABASE_URL
- PORT
- CORS_ORIGIN if needed later

Keep local development simple:
- backend: http://localhost:4000
- frontend: http://localhost:5173
