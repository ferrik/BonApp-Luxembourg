# MONETIZATION_NOTES.md

## MVP principle
Do not charge restaurants during the first validation stage.

First validate:
- clicks;
- restaurant interest;
- willingness to pay.

## What BonApp tracks now
BonApp tracks intent, not confirmed orders.

Tracked events:
- restaurant_view
- order_click
- call_click
- website_click

## Future pricing options
Option 1: Subscription
- 20-50 EUR/month per restaurant
- best for simplicity and low conflict

Option 2: Per-click / per-lead
- 1-3 EUR per qualified click
- requires trust in analytics

Option 3: Hybrid
- free trial
- then subscription + optional premium visibility

## Recommended path
Phase 1:
- free trial
- no billing
- collect clicks

Phase 2:
- show restaurants basic click analytics
- ask if they would pay

Phase 3:
- start with subscription or manual invoice

Phase 4:
- add Stripe / invoicing only after real revenue interest

## Monetization-ready database fields
- billing_enabled
- pricing_plan
- restaurant_usage_daily

## Not implemented in MVP
- Stripe
- invoices
- VAT
- subscription logic
- checkout
