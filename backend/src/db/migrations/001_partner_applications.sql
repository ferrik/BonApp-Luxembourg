-- Migration 001: partner_applications
-- Stores restaurant partner join / update requests.
-- status must be manually changed to 'active' in DB; nothing auto-publishes.

CREATE TABLE IF NOT EXISTS partner_applications (
  id                    SERIAL PRIMARY KEY,

  -- Application type
  application_type      TEXT NOT NULL DEFAULT 'join',   -- 'join' | 'update'
  existing_restaurant_id INT REFERENCES restaurants(id) ON DELETE SET NULL,

  -- Restaurant info (submitted by applicant)
  restaurant_name       TEXT NOT NULL,
  cuisine_type          TEXT,
  city                  TEXT,
  address               TEXT,

  -- Contact
  contact_name          TEXT NOT NULL,
  contact_phone         TEXT,
  contact_email         TEXT NOT NULL,

  -- Online presence
  website_url           TEXT,
  ordering_url          TEXT,   -- direct order / delivery URL
  menu_url              TEXT,   -- link to menu / PDF / Drive

  -- Service flags
  offers_delivery       BOOLEAN NOT NULL DEFAULT FALSE,
  offers_pickup         BOOLEAN NOT NULL DEFAULT FALSE,

  -- Delivery details
  delivery_areas        TEXT,
  min_order_eur         NUMERIC(6,2),
  delivery_fee_eur      NUMERIC(6,2),
  est_delivery_min      INT,    -- estimated delivery time in minutes

  -- Free-text
  notes                 TEXT,

  -- Moderation
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'active', 'rejected')),
  admin_notes           TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_partner_applications_status
  ON partner_applications (status);

CREATE INDEX IF NOT EXISTS idx_partner_applications_created
  ON partner_applications (created_at DESC);
