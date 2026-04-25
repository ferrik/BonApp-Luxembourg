// Restaurant entity as returned by the API
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
  created_at: string
  updated_at: string
}

export type EventType = 'restaurant_view' | 'order_click' | 'call_click' | 'website_click'

export interface TrackingPayload {
  restaurant_id: number
  event_type: EventType
}

export interface TrackingResponse {
  ok: boolean
  message: string
}

export type CuisineCategory =
  | 'Italian'
  | 'Asian'
  | 'Burger'
  | 'Kebab'
  | 'Local'
  | 'Healthy'
  | 'Indian'
  | 'Other'
  | 'Surprise'
