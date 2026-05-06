import { useState } from 'react'
import type { Restaurant } from '../types'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'
import { trackEvent } from '../lib/api'

interface Props {
  restaurant: Restaurant
  rank?: number          // 1 | 2 | 3
  selectedScenario?: string
}

// Resolve image URL — never show empty image area
function resolveImage(r: Restaurant, scenario?: string): string {
  if (r.image_url) return r.image_url
  if (r.pexels_url) return r.pexels_url
  const scenarioMap: Record<string, string> = {
    dinner: '/images/placeholder-dinner.jpg',
    coffee: '/images/placeholder-coffee.jpg',
    drinks: '/images/placeholder-drinks.jpg',
    quick:  '/images/placeholder-quick.jpg',
  }
  return (scenario && scenarioMap[scenario]) ?? '/images/placeholder-restaurant.jpg'
}

// Price range indicator
function priceLabel(range: number): string {
  if (range === 1) return '€'
  if (range === 3) return '€€€'
  return '€€'
}

// Google Maps route URL
function googleMapsRoute(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

// Toggle save in localStorage
function toggleSave(restaurantId: number, restaurantName: string): boolean {
  try {
    const saved: number[] = JSON.parse(localStorage.getItem('bonapp_saved') || '[]')
    const idx = saved.indexOf(restaurantId)
    if (idx === -1) {
      saved.push(restaurantId)
      trackEvent('saved_restaurant', { restaurant_id: restaurantId, name: restaurantName })
    } else {
      saved.splice(idx, 1)
    }
    localStorage.setItem('bonapp_saved', JSON.stringify(saved))
    return idx === -1 // returns true if now saved
  } catch {
    return false
  }
}

function isSaved(restaurantId: number): boolean {
  try {
    const saved: number[] = JSON.parse(localStorage.getItem('bonapp_saved') || '[]')
    return saved.includes(restaurantId)
  } catch {
    return false
  }
}

export default function RestaurantCard({ restaurant: r, rank, selectedScenario }: Props) {
  const { lang } = useLang()
  const [saved, setSaved] = useState(() => isSaved(r.id))
  const [imgError, setImgError] = useState(false)

  const imageUrl = imgError ? '/images/placeholder-restaurant.jpg' : resolveImage(r, selectedScenario)
  const hasPhone   = Boolean(r.phone)
  const hasCoords  = r.lat != null && r.lng != null
  const hasWebsite = Boolean(r.website_url)

  // CTA priority per spec
  let primaryCTA: { label: string; href: string; event: string } | null = null
  const secondaryCTAs: { label: string; href: string; event: string }[] = []

  if (hasPhone) {
    primaryCTA = { label: t('card.call', lang), href: `tel:${r.phone}`, event: 'click_call' }
  } else if (hasCoords) {
    primaryCTA = { label: t('card.route', lang), href: googleMapsRoute(r.lat!, r.lng!), event: 'click_route' }
  } else if (hasWebsite) {
    primaryCTA = { label: t('card.menu', lang), href: r.website_url!, event: 'click_menu' }
  }

  if (hasCoords && primaryCTA?.event !== 'click_route') {
    secondaryCTAs.push({ label: t('card.route', lang), href: googleMapsRoute(r.lat!, r.lng!), event: 'click_route' })
  }
  if (hasWebsite && primaryCTA?.event !== 'click_menu') {
    secondaryCTAs.push({ label: t('card.menu', lang), href: r.website_url!, event: 'click_menu' })
  }

  function handleSave(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const nowSaved = toggleSave(r.id, r.name)
    setSaved(nowSaved)
  }

  function handleCTA(e: React.MouseEvent, eventName: string, href: string) {
    e.stopPropagation()
    trackEvent(eventName, { restaurant_id: r.id, name: r.name })
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      id={`restaurant-card-${r.id}`}
      className="card relative overflow-hidden"
    >
      {/* ── IMAGE ── */}
      <div className="relative w-full" style={{ height: '200px' }}>
        <img
          src={imageUrl}
          alt={r.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />

        {/* Save heart (top-left) */}
        <button
          id={`save-btn-${r.id}`}
          onClick={handleSave}
          aria-label={saved ? 'Unsave restaurant' : 'Save restaurant'}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-zinc-900/70 backdrop-blur-sm flex items-center justify-center text-lg hover:scale-110 transition-transform active:scale-90"
        >
          {saved ? '♥' : '♡'}
        </button>

        {/* Verified badge (top-right) */}
        {r.verified && (
          <div className="absolute top-3 right-3">
            <span className="badge-verified text-[11px] px-2 py-0.5">
              ✓ {t('card.verified', lang)}
            </span>
          </div>
        )}

        {/* Fallback label (bottom-left of image) */}
        {r._is_fallback && (
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] bg-zinc-800/90 text-zinc-400 px-2 py-0.5 rounded-full">
              {t('card.bestNearby', lang)}
            </span>
          </div>
        )}

        {/* Rank badge (bottom-right of image) */}
        {rank != null && (
          <div className="absolute bottom-3 right-3">
            <span className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-extrabold flex items-center justify-center shadow-lg">
              {rank}
            </span>
          </div>
        )}
      </div>

      {/* ── CARD BODY ── */}
      <div className="p-4">
        {/* Name + cuisine + city row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="text-base font-bold text-white leading-snug flex-1">
            {r.name}
          </h2>
          {/* Price range */}
          <span className="text-sm font-bold text-brand-400 shrink-0">
            {priceLabel(r.price_range ?? 2)}
          </span>
        </div>

        {/* Cuisine · City · Vibe */}
        <div className="flex items-center flex-wrap gap-1.5 mb-3 text-xs text-zinc-500">
          {r.cuisine_primary && <span>{r.cuisine_primary}</span>}
          {r.city && <><span>·</span><span>📍 {r.city}</span></>}
          {r.vibe && (
            <span className="ml-auto badge badge-zinc capitalize">{r.vibe}</span>
          )}
        </div>

        {/* Notes / description (if present) */}
        {r.notes && (
          <p className="text-xs text-zinc-400 mb-3 leading-relaxed line-clamp-2">
            {r.notes}
          </p>
        )}

        {/* ── CTAs ── */}
        {primaryCTA && (
          <a
            id={`cta-primary-${r.id}`}
            href={primaryCTA.href}
            onClick={(e) => handleCTA(e, primaryCTA!.event, primaryCTA!.href)}
            className="btn-primary w-full py-3 rounded-xl mb-2 text-sm font-bold text-center block"
          >
            {primaryCTA.label}
          </a>
        )}

        {secondaryCTAs.length > 0 && (
          <div className="flex gap-2">
            {secondaryCTAs.map((cta) => (
              <a
                key={cta.event}
                id={`cta-${cta.event.replace('click_', '')}-${r.id}`}
                href={cta.href}
                onClick={(e) => handleCTA(e, cta.event, cta.href)}
                className="btn-secondary flex-1 py-2.5 rounded-xl text-xs font-semibold text-center"
              >
                {cta.label}
              </a>
            ))}
          </div>
        )}

        {!primaryCTA && (
          <p className="text-center text-zinc-500 text-xs py-2">
            {t('restaurant.notAvailable', lang)}
          </p>
        )}
      </div>
    </div>
  )
}
