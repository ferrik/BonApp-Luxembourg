// Restaurant entity as returned by the API (v3)
export interface Restaurant {
  id: number
  name: string
  city: string | null
  commune: string | null
  cluster: string | null
  address: string | null
  phone: string | null
  website_url: string | null
  delivery_url: string | null
  cuisine_primary: string | null
  cuisine_secondary: string | null
  own_delivery: boolean
  pickup: boolean
  direct_ordering: boolean
  third_party: boolean
  min_order_eur: number | null
  delivery_fee_eur: number | null
  delivery_zone_notes: string | null
  source_name: string | null
  source_url: string | null
  verification_status: 'pending' | 'verified' | 'inferred' | 'unverified' | 'needs_verification'
  partner_status: string
  billing_enabled: boolean
  pricing_plan: string
  notes: string | null
  opening_hours: string | null
  created_at: string
  updated_at: string
  // v3 discovery fields
  image_url: string | null
  pexels_url: string | null
  image_source: string | null
  image_status: string | null
  vibe: string | null
  seating: string | null
  parking: boolean
  scenario: string[] | null
  lat: number | null
  lng: number | null
  price_range: number       // 1=€  2=€€  3=€€€
  group_size_max: number
  hours: Record<string, string> | null
  verified: boolean
  // injected by backend to signal fallback was used
  _is_fallback?: boolean
}

export type EventType = 'restaurant_view' | 'call_click' | 'website_click' | 'route_click'

export interface TrackingPayload {
  restaurant_id: number
  event_type: EventType
}

export interface TrackingResponse {
  ok: boolean
  message: string
}

export type Scenario = 'dinner' | 'coffee' | 'drinks' | 'quick'

export type CuisineCategory =
  | 'Italian'
  | 'Asian'
  | 'Burger'
  | 'Kebab'
  | 'Local'
  | 'Healthy'
  | 'Indian'
  | 'Other'

// Partner application — submitted via /partners page
export interface PartnerApplicationPayload {
  application_type: 'join' | 'update'
  existing_restaurant_id?: number | null

  restaurant_name: string
  cuisine_type?: string
  city?: string
  address?: string

  contact_name: string
  contact_phone?: string
  contact_email: string

  website_url?: string
  ordering_url?: string
  menu_url?: string
  image_url?: string

  offers_delivery: boolean
  offers_pickup: boolean

  delivery_areas?: string
  min_order_eur?: number | null
  delivery_fee_eur?: number | null
  est_delivery_min?: number | null

  notes?: string
  opening_hours?: string
}

export interface PartnerApplicationResponse {
  ok: boolean
  id: number
  status: 'pending'
  message: string
}
