-- BonApp Luxembourg MVP - PostgreSQL starter schema
-- Use this as a reference. Antigravity should compare this with DATA_SCHEMA.md before applying changes.

CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  commune TEXT,
  cluster TEXT,
  address TEXT,
  phone TEXT,
  website_url TEXT,
  delivery_url TEXT,

  cuisine_primary TEXT,
  cuisine_secondary TEXT,

  own_delivery BOOLEAN DEFAULT FALSE,
  pickup BOOLEAN DEFAULT FALSE,
  direct_ordering BOOLEAN DEFAULT FALSE,
  third_party BOOLEAN DEFAULT FALSE,

  min_order_eur NUMERIC(10,2),
  delivery_fee_eur NUMERIC(10,2),
  delivery_zone_notes TEXT,

  source_name TEXT,
  source_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'inferred', 'unverified', 'needs_verification')),

  partner_status TEXT DEFAULT 'new' CHECK (partner_status IN ('new', 'contacted', 'interested', 'follow_up', 'trial', 'active', 'premium', 'paused', 'onboarded', 'rejected')),
  billing_enabled BOOLEAN DEFAULT FALSE,
  pricing_plan TEXT DEFAULT 'free' CHECK (pricing_plan IN ('free', 'per_click', 'subscription', 'hybrid')),
  notes TEXT,

  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurant_clicks (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('restaurant_view', 'order_click', 'call_click', 'website_click')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurant_usage_daily (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  restaurant_views INTEGER DEFAULT 0,
  order_clicks INTEGER DEFAULT 0,
  call_clicks INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  UNIQUE (restaurant_id, usage_date)
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_restaurants_updated_at ON restaurants;
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON restaurants
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_restaurant_usage_daily_updated_at ON restaurant_usage_daily;
CREATE TRIGGER update_restaurant_usage_daily_updated_at
BEFORE UPDATE ON restaurant_usage_daily
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_commune ON restaurants(commune);
CREATE INDEX IF NOT EXISTS idx_restaurants_cluster ON restaurants(cluster);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_primary ON restaurants(cuisine_primary);
CREATE INDEX IF NOT EXISTS idx_restaurants_own_delivery ON restaurants(own_delivery);
CREATE INDEX IF NOT EXISTS idx_restaurants_pickup ON restaurants(pickup);
CREATE INDEX IF NOT EXISTS idx_restaurants_direct_ordering ON restaurants(direct_ordering);
CREATE INDEX IF NOT EXISTS idx_restaurants_partner_status ON restaurants(partner_status);
CREATE INDEX IF NOT EXISTS idx_restaurants_verification_status ON restaurants(verification_status);
CREATE INDEX IF NOT EXISTS idx_restaurants_billing_enabled ON restaurants(billing_enabled);
CREATE INDEX IF NOT EXISTS idx_restaurants_pricing_plan ON restaurants(pricing_plan);

CREATE INDEX IF NOT EXISTS idx_restaurant_clicks_restaurant_id ON restaurant_clicks(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_clicks_event_type ON restaurant_clicks(event_type);
CREATE INDEX IF NOT EXISTS idx_restaurant_clicks_created_at ON restaurant_clicks(created_at);

CREATE INDEX IF NOT EXISTS idx_restaurant_usage_daily_restaurant_id ON restaurant_usage_daily(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_usage_daily_usage_date ON restaurant_usage_daily(usage_date);
