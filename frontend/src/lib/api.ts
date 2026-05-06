import type { Restaurant, TrackingPayload, TrackingResponse, PartnerApplicationPayload, PartnerApplicationResponse } from '../types'

// In dev: Vite proxies /api to http://localhost:4000
// In production: VITE_API_URL must point to Render backend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BASE_URL = ((import.meta as any).env?.VITE_API_URL ?? '') + '/api'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export async function fetchRestaurants(params?: {
  scenario?: string
  city?: string
  price_range?: number
  group_size?: number
  cuisine?: string   // legacy / admin
  limit?: number
}): Promise<Restaurant[]> {
  const url = new URL(BASE_URL + '/restaurants', window.location.origin)
  if (params?.scenario)    url.searchParams.set('scenario',    params.scenario)
  if (params?.city)        url.searchParams.set('city',        params.city)
  if (params?.price_range) url.searchParams.set('price_range', String(params.price_range))
  if (params?.group_size)  url.searchParams.set('group_size',  String(params.group_size))
  if (params?.cuisine)     url.searchParams.set('cuisine',     params.cuisine)
  if (params?.limit)       url.searchParams.set('limit',       String(params.limit))
  const res = await fetch(url.toString())
  return handleResponse<Restaurant[]>(res)
}

export async function fetchCities(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/restaurants/cities`)
  return handleResponse<string[]>(res)
}

export async function fetchRestaurantById(id: number): Promise<Restaurant> {
  const res = await fetch(`${BASE_URL}/restaurants/${id}`)
  return handleResponse<Restaurant>(res)
}

export async function trackClick(payload: TrackingPayload): Promise<TrackingResponse> {
  const res = await fetch(`${BASE_URL}/tracking/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleResponse<TrackingResponse>(res)
}

export async function submitPartnerApplication(
  payload: PartnerApplicationPayload
): Promise<PartnerApplicationResponse> {
  const res = await fetch(`${BASE_URL}/partners/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleResponse<PartnerApplicationResponse>(res)
}

// ── trackEvent: always stores locally, silently sends to backend ─────────────
export function trackEvent(name: string, data: Record<string, unknown> = {}): void {
  // Local fallback — never lose data
  try {
    const events = JSON.parse(localStorage.getItem('bonapp_events') || '[]') as unknown[]
    events.push({ name, data, ts: Date.now() })
    localStorage.setItem('bonapp_events', JSON.stringify(events.slice(-100)))
  } catch {
    // ignore storage errors
  }

  // Backend — silent fail, never block UX
  fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_name: name, data }),
  }).catch(() => {})
}
