# PROJECT_SCOPE.md

## Project name
BonApp Luxembourg MVP

## Vision
A lightweight food discovery platform for Luxembourg that helps users quickly choose where to order from, focusing on restaurants that already support own delivery, pickup, direct online ordering, or phone ordering.

## What BonApp is
BonApp is a discovery and lead-generation layer.

It helps users:
- choose a food category;
- see a small number of relevant restaurant options;
- open the restaurant page;
- click to order, call, or open the restaurant website.

It helps restaurants:
- receive additional traffic;
- see basic click analytics;
- test whether BonApp can generate demand.

## What BonApp is not
BonApp is not:
- an Uber Eats or Wolt clone;
- a courier fleet;
- a payment processor;
- a cart / checkout system;
- a restaurant menu management system;
- a full restaurant SaaS platform.

## MVP user flow
Home -> Category -> 3 options -> Restaurant detail -> CTA -> Tracking

## Primary geography
Start with South Luxembourg clusters:
- Esch-sur-Alzette
- Sanem
- Schifflange
- Differdange
- Dudelange
- Pétange
- Luxembourg City as a secondary / later cluster

## Primary audience
Phase 1 target users:
- expats;
- office workers;
- people who want fast food decisions;
- users who prefer direct ordering or local restaurants.

## MVP cuisine focus
- Italian / Pizza
- Asian / Sushi
- Burger / Fast food
- Kebab
- Indian / Nepalese
- Local / French as secondary

## MVP success criteria
Technical success:
- frontend runs at http://localhost:5173;
- backend runs at http://localhost:4000;
- no browser console errors during the main flow;
- CTA clicks are recorded in PostgreSQL.

Content success:
- real restaurant records can be imported from JSON;
- missing data is not invented;
- each record has verification status.

Business validation success:
- 10+ real CTA clicks;
- 5 restaurants respond to outreach;
- at least 1 restaurant says it would test or pay for visibility / traffic.

## Monetization hypothesis
Do not implement payments now.

Future pricing options:
- free trial;
- 20-50 EUR/month subscription;
- 1-3 EUR per qualified click / lead;
- hybrid model.

## Current monetization principle
Track intent, not confirmed orders.

BonApp tracks:
- restaurant_view;
- order_click;
- call_click;
- website_click.

BonApp does not claim confirmed order attribution in MVP.
