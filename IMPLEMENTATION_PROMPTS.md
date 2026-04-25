# IMPLEMENTATION_PROMPTS.md

## Task order
Use MASTER_PROMPT for every task.

Recommended order:
1. Fix frontend startup
2. Validate database schema
3. Verify / implement tracking API
4. Build / fix UX flow
5. Add legal pages
6. Import restaurant JSON
7. Add simple admin
8. Run final smoke test

---

## Task 1 - Fix frontend startup
Use MASTER_PROMPT.

Task:
Fix frontend startup issues.

Context:
Backend should run on http://localhost:4000.
Frontend should run on http://localhost:5173.
Vite may fail because of BOM, invalid JSON, PostCSS, Tailwind, or config issues.

Do:
- inspect frontend folder;
- check package.json, vite config, tsconfig, postcss config, tailwind config, index.html, src files;
- convert files to UTF-8 without BOM if needed;
- validate JSON;
- validate PostCSS / Tailwind setup;
- reinstall dependencies only if needed;
- run npm run dev;
- return full error log if still failing.

Do not:
- redesign UI;
- change backend;
- add new features.

Goal:
Frontend runs at http://localhost:5173.

---

## Task 2 - Validate database schema
Use MASTER_PROMPT.

Task:
Validate current PostgreSQL schema against DATA_SCHEMA.md.

Requirements:
- inspect backend/src/db/schema.sql;
- confirm restaurants table;
- confirm restaurant_clicks table;
- confirm restaurant_usage_daily table or add it if not present;
- confirm event_type constraint;
- confirm updated_at trigger;
- confirm indexes for city, commune, cuisine_primary, own_delivery, pickup, direct_ordering, partner_status, verification_status, billing_enabled, pricing_plan;
- do not add payments;
- do not add Stripe.

Provide SQL checks:
- list tables;
- describe restaurants;
- describe restaurant_clicks;
- SELECT COUNT(*) FROM restaurants;
- SELECT verification_status, COUNT(*) FROM restaurants GROUP BY verification_status;

---

## Task 3 - Tracking API
Use MASTER_PROMPT.

Task:
Implement or verify POST /api/tracking/click.

Requirements:
- validate restaurant_id exists;
- validate event_type is one of restaurant_view, order_click, call_click, website_click;
- insert into restaurant_clicks;
- return clear JSON;
- do not build analytics dashboard;
- do not add auth;
- do not add payments.

---

## Task 4 - UX flow
Use MASTER_PROMPT.

Task:
Build the MVP UX flow.

Flow:
Home -> Category -> 3 results -> Restaurant detail -> CTA click

Requirements:
- Home page with category buttons;
- categories: Pizza, Sushi, Burger, Kebab, Asian, Surprise me;
- show max 3 restaurant cards by default;
- restaurant detail page;
- CTA buttons: Order directly, Call, Website;
- support English and French UI text;
- mobile-first;
- no login;
- no payment;
- no courier logic.

---

## Task 5 - Legal pages
Use MASTER_PROMPT.

Task:
Create minimal legal pages for MVP.

Pages:
- Terms of Service
- Privacy Policy
- Legal Notice
- Partner Terms

Requirements:
- English + French;
- simple language;
- position BonApp as a directory / discovery platform;
- orders and payments happen directly between user and restaurant;
- no fake company data;
- add footer links;
- add homepage disclaimer.

---

## Task 6 - Import restaurants JSON
Use MASTER_PROMPT.

Task:
Import restaurant dataset from JSON.

Requirements:
- accept DATA_SEED.json or restaurants.json;
- normalize fields according to DATA_SCHEMA.md;
- do not invent missing values;
- mark missing values as null or needs_verification;
- set verification_status default to pending;
- preserve source_name and source_url if present;
- make import idempotent;
- avoid duplicates using name + city or name + address;
- output import summary.

After import, run:
SELECT COUNT(*) FROM restaurants;
SELECT verification_status, COUNT(*) FROM restaurants GROUP BY verification_status;
SELECT cuisine_primary, COUNT(*) FROM restaurants GROUP BY cuisine_primary ORDER BY COUNT(*) DESC;
SELECT city, COUNT(*) FROM restaurants GROUP BY city ORDER BY COUNT(*) DESC;

---

## Task 7 - Admin MVP
Use MASTER_PROMPT.

Task:
Build a simple admin interface.

Requirements:
- list restaurants;
- edit verification_status;
- edit partner_status;
- edit notes;
- no authentication yet;
- add visible TODO that auth is required before production;
- do not build complex CRM.

---

## Task 8 - Final smoke test
Use MASTER_PROMPT.

Task:
Run final MVP healthcheck.

Steps:
1. Start backend.
2. Start frontend.
3. Open http://localhost:5173.
4. Select category.
5. Confirm 3 restaurant cards render.
6. Open restaurant detail.
7. Click Order / Call / Website.
8. Confirm restaurant_clicks stores the event.
9. Report issues and fix only current blockers.
