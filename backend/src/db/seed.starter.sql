-- Demo seed data only. Do not treat these as real restaurants.

INSERT INTO restaurants (
  name, city, commune, cluster, phone, website_url, delivery_url,
  cuisine_primary, cuisine_secondary,
  own_delivery, pickup, direct_ordering, third_party,
  min_order_eur, delivery_fee_eur, delivery_zone_notes,
  source_name, source_url, verification_status, partner_status,
  billing_enabled, pricing_plan, notes
)
VALUES
  ('Demo Pizza Lab', 'Esch-sur-Alzette', 'Esch-sur-Alzette', 'South Luxembourg', '+352 20 00 00 01', 'https://example.com/demo-pizza-lab', 'https://example.com/demo-pizza-lab/order', 'Italian', 'Pizza', true, true, true, false, 15.00, 2.50, 'Demo data only.', 'demo-seed', NULL, 'pending', 'new', false, 'free', 'Demo record. Not a real production restaurant.'),
  ('Demo Sushi House', 'Sanem', 'Sanem', 'South Luxembourg', '+352 20 00 00 02', 'https://example.com/demo-sushi-house', NULL, 'Asian', 'Sushi', true, false, true, false, 20.00, 3.00, 'Demo data only.', 'demo-seed', NULL, 'pending', 'new', false, 'free', 'Demo record. Not a real production restaurant.'),
  ('Demo Burger Corner', 'Differdange', 'Differdange', 'South Luxembourg', '+352 20 00 00 03', 'https://example.com/demo-burger-corner', NULL, 'Burger', 'Fast food', false, true, false, true, 10.00, NULL, 'Demo data only.', 'demo-seed', NULL, 'pending', 'new', false, 'free', 'Demo record. Not a real production restaurant.');
