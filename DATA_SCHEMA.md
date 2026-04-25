# DATA_SCHEMA.md

## Database
PostgreSQL is the database. Do not switch to SQLite unless explicitly instructed.

## Table: restaurants
Required / core fields:
- id: SERIAL or UUID primary key depending on implementation
- name: TEXT NOT NULL
- city: TEXT
- commune: TEXT
- cluster: TEXT
- address: TEXT
- phone: TEXT
- website_url: TEXT
- delivery_url: TEXT

Classification:
- cuisine_primary: TEXT
- cuisine_secondary: TEXT

Delivery:
- own_delivery: BOOLEAN DEFAULT FALSE
- pickup: BOOLEAN DEFAULT FALSE
- direct_ordering: BOOLEAN DEFAULT FALSE
- third_party: BOOLEAN DEFAULT FALSE

Pricing:
- min_order_eur: NUMERIC(10,2)
- delivery_fee_eur: NUMERIC(10,2)
- delivery_zone_notes: TEXT

Source and verification:
- source_name: TEXT
- source_url: TEXT
- verification_status: TEXT DEFAULT 'pending'

Partner / monetization-ready:
- partner_status: TEXT DEFAULT 'new'
- billing_enabled: BOOLEAN DEFAULT FALSE
- pricing_plan: TEXT DEFAULT 'free'
- notes: TEXT

Timestamps:
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

## Allowed verification_status values
- pending
- verified
- inferred
- unverified
- needs_verification

## Allowed partner_status values
- new
- contacted
- interested
- follow_up
- trial
- active
- premium
- paused
- onboarded
- rejected

## Allowed pricing_plan values
- free
- per_click
- subscription
- hybrid

## Table: restaurant_clicks
- id: SERIAL PRIMARY KEY
- restaurant_id: INTEGER REFERENCES restaurants(id) ON DELETE CASCADE
- event_type: TEXT NOT NULL
- created_at: TIMESTAMP DEFAULT NOW()

## Allowed event_type values
- restaurant_view
- order_click
- call_click
- website_click

## Table: restaurant_usage_daily
Future monetization-ready aggregation table.

Fields:
- id: SERIAL PRIMARY KEY
- restaurant_id: INTEGER REFERENCES restaurants(id) ON DELETE CASCADE
- usage_date: DATE NOT NULL
- restaurant_views: INTEGER DEFAULT 0
- order_clicks: INTEGER DEFAULT 0
- call_clicks: INTEGER DEFAULT 0
- website_clicks: INTEGER DEFAULT 0
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

Unique constraint:
- restaurant_id + usage_date

## Indexes recommended
restaurants:
- city
- commune
- cluster
- cuisine_primary
- own_delivery
- pickup
- direct_ordering
- partner_status
- verification_status
- billing_enabled
- pricing_plan

restaurant_clicks:
- restaurant_id
- event_type
- created_at

restaurant_usage_daily:
- restaurant_id
- usage_date

## Data import rules
- Source format: JSON.
- Do not invent missing data.
- Missing values: null or needs_verification.
- Conservative duplicate match:
  - name + city;
  - name + address if available.
- Do not overwrite manually edited values without warning.
