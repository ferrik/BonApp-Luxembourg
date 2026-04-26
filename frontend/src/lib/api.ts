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
  cuisine?: string
  limit?: number
}): Promise<Restaurant[]> {
  const url = new URL(BASE_URL + '/restaurants', window.location.origin)
  if (params?.cuisine) url.searchParams.set('cuisine', params.cuisine)
  if (params?.limit) url.searchParams.set('limit', String(params.limit))
  const res = await fetch(url.toString())
  return handleResponse<Restaurant[]>(res)
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
