---
name: monetization-ready
---

# Skill: Monetization-Ready Architecture

Use this skill when preparing the database and product for future monetization without implementing payments.

## Allowed now
- billing_enabled field;
- pricing_plan field;
- partner_status field;
- restaurant_usage_daily table;
- basic click analytics.

## Not allowed now
- Stripe;
- checkout;
- subscriptions;
- invoices;
- VAT logic;
- payment provider integration.

## Business principle
BonApp tracks intent, not confirmed orders.

## Future pricing options
- free trial;
- subscription;
- per-click;
- hybrid.
