# AGENTS.md

## Project
BonApp Luxembourg MVP.

BonApp is a directory / discovery platform for restaurants in Luxembourg that already have their own delivery, pickup, direct ordering, or phone ordering.

BonApp is not a delivery company.
BonApp is not a payment processor.
BonApp is not responsible for food preparation, delivery, refunds, delays, or restaurant service quality.

## Core MVP principle
Build only what helps validate this flow:

Category -> 3 restaurant options -> Restaurant detail -> CTA click -> Tracking -> Partner validation

## Strict rules
- No payments in MVP.
- No courier logic.
- No user accounts or authentication in MVP.
- No cart system.
- No menu management.
- No fake restaurant data.
- No overengineering.
- Prefer fixing existing code over rewriting.
- Do not refactor unrelated files.
- Always work inside the existing folder structure.
- Never move files or create new folders unless explicitly required by the task.
- If something fails, run commands and inspect logs before changing code.
- Never say "done" unless the project actually runs or the limitation is clearly explained.

## Technical defaults
Frontend:
- React
- Vite
- TypeScript
- Tailwind CSS if already installed

Backend:
- Node.js
- Express
- TypeScript

Database:
- PostgreSQL

Data exchange:
- JSON

## Language rules
- User-facing UI: English and French.
- Developer comments, logs, API names, database fields: English.
- Do not translate restaurant names.
- Do not translate city or commune names unless the source provides a standard version.
- Never use Lorem Ipsum.
- If content is missing, use "Contact for details" or null depending on context.

## Data quality rules
- Unknown data must be stored as null or marked needs_verification.
- Missing facts must not be invented.
- Restaurant source and verification status must be preserved.
- Restaurant records should support manual verification.
- Phone numbers should use Luxembourg format where possible: +352 ...

## Restaurant classification
Preferred MVP cuisine categories:
- Italian
- Asian
- Burger
- Kebab
- Local
- Healthy
- Indian
- Other

## Monetization rules
The system may be prepared for future monetization but must not implement payments now.

Allowed now:
- partner_status
- billing_enabled
- pricing_plan
- usage aggregation tables
- click tracking

Not allowed now:
- Stripe
- invoices
- VAT logic
- subscription billing
- payment checkout

## Legal positioning
BonApp must be presented as a directory and discovery platform.
All orders and transactions happen directly between the user and the restaurant.

## Workflow for every task
1. Read AGENTS.md.
2. Read ARCHITECTURE.md.
3. Read PROJECT_SCOPE.md.
4. Read DATA_SCHEMA.md.
5. Read MVP_TASKLIST.md.
6. Read IMPLEMENTATION_PROMPTS.md if the task is technical.
7. Inspect the repository.
8. Propose the smallest viable solution.
9. Implement only what is required.
10. Run the relevant command or explain clearly why it cannot be run.

## Output format after every task
Return:

### What I changed
- ...

### Files touched
- ...

### Commands run
- ...

### How to run
- ...

### How to test manually
- ...

### Risks / TODO
- ...

## Definition of Done
A task is done only if:
- code compiles or the remaining blocker is clearly identified;
- feature is reachable through UI, API, or script;
- manual test steps are included;
- no fake production data was added;
- no unrelated architecture changes were made.
