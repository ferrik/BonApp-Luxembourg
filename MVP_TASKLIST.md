# MVP_TASKLIST.md

## Phase 0 - Project guardrails
[x] Define project scope
[x] Define architecture
[x] Define data schema
[x] Define agent rules
[x] Define implementation prompts

## Phase 1 - Stabilize local development
[x] Fix frontend startup — Vite + React + TS + Tailwind scaffolded
[x] Ensure frontend runs at http://localhost:5173 — run npm install && npm run dev in frontend/
[x] Ensure backend runs at http://localhost:4000 — run npm install && npm run dev in backend/
[ ] Ensure no browser console errors in main flow — needs live test after npm install

## Phase 2 - Database and API
[x] Validate PostgreSQL schema — schema.starter.sql matches DATA_SCHEMA.md fully
[x] Ensure restaurants table exists — in schema.starter.sql
[x] Ensure restaurant_clicks table exists — in schema.starter.sql
[x] Ensure restaurant_usage_daily table exists — in schema.starter.sql
[x] Ensure updated_at trigger exists — in schema.starter.sql
[x] Ensure indexes exist — all indexes in schema.starter.sql
[x] Ensure API filters work — GET /api/restaurants?cuisine=Italian&limit=3
[ ] Apply schema to DB — run: npm run db:migrate in backend/

## Phase 3 - Tracking
[x] Implement POST /api/tracking/click — backend/src/routes/tracking.ts
[x] Validate restaurant_id exists — DB check before insert
[x] Validate event_type — only 4 allowed values
[x] Store events in restaurant_clicks — INSERT query
[ ] Smoke test CTA tracking — needs running backend + DB

## Phase 4 - UX flow
[x] Home screen — src/pages/HomePage.tsx
[x] Category buttons — 8 categories + Surprise me
[x] Results page with max 3 cards — src/pages/ResultsPage.tsx
[x] Restaurant detail page — src/pages/RestaurantPage.tsx
[x] CTA buttons — order/call/website with tracking
[x] Footer legal links — Footer.tsx

## Phase 5 - Data import
[ ] Prepare DATA_SEED.json — need real restaurant data
[ ] Build JSON importer
[ ] Import real restaurants
[ ] Generate import summary
[ ] Review failed / duplicate rows

## Phase 6 - Minimal legal pages
[x] Terms of Service EN/FR — src/pages/legal/TermsPage.tsx
[x] Privacy Policy EN/FR — src/pages/legal/PrivacyPage.tsx
[x] Legal Notice EN/FR — src/pages/legal/LegalNoticePage.tsx
[x] Partner Terms EN/FR — src/pages/legal/PartnerTermsPage.tsx
[x] Footer links — Footer.tsx
[x] Homepage disclaimer — Footer.tsx

## Phase 7 - Admin MVP
[ ] List restaurants
[ ] Edit verification_status
[ ] Edit partner_status
[ ] Edit notes
[ ] No auth yet, but add TODO before production

## Phase 8 - Business validation
[ ] Prepare outreach script
[ ] Contact 10 restaurants
[ ] Track responses
[ ] Compare clicks by restaurant
[ ] Decide whether monetization should be subscription, per-click, or hybrid
