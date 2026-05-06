import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { fetchRestaurantById, trackEvent } from '../lib/api'
import type { Restaurant } from '../types'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'

// Google Maps route URL
function googleMapsRoute(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

// Price range label
function priceLabel(range: number): string {
  if (range === 1) return '€'
  if (range === 3) return '€€€'
  return '€€'
}

// Resolve image — never empty
function resolveImage(r: Restaurant): string {
  if (r.image_url) return r.image_url
  if (r.pexels_url) return r.pexels_url
  return '/images/placeholder-restaurant.jpg'
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
    return idx === -1
  } catch { return false }
}

function isSaved(restaurantId: number): boolean {
  try {
    const saved: number[] = JSON.parse(localStorage.getItem('bonapp_saved') || '[]')
    return saved.includes(restaurantId)
  } catch { return false }
}

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { lang } = useLang()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!id) return
    const rid = Number(id)
    setLoading(true)
    fetchRestaurantById(rid)
      .then((data) => {
        setRestaurant(data)
        setSaved(isSaved(rid))
        // Track page view (fire & forget)
        trackEvent('restaurant_view', { restaurant_id: rid })
      })
      .catch(() => setError(t('error.notFound', lang)))
      .finally(() => setLoading(false))
  }, [id, lang])

  if (loading) {
    return (
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 animate-pulse">
        <div className="h-4 w-24 bg-zinc-800 rounded mb-6" />
        <div className="card">
          <div className="w-full bg-zinc-800" style={{ height: '240px' }} />
          <div className="p-6 space-y-4">
            <div className="h-6 w-2/3 bg-zinc-800 rounded" />
            <div className="h-4 w-1/3 bg-zinc-800 rounded" />
            <div className="h-12 bg-zinc-800 rounded-xl" />
            <div className="h-12 bg-zinc-800 rounded-xl" />
          </div>
        </div>
      </main>
    )
  }

  if (error || !restaurant) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center text-zinc-400 py-16">
          <p className="mb-4">{error ?? t('error.notFound', lang)}</p>
          <button onClick={() => navigate(-1)} className="btn-secondary">
            {t('results.back', lang)}
          </button>
        </div>
      </main>
    )
  }

  const r = restaurant

  const hasPhone   = Boolean(r.phone)
  const hasCoords  = r.lat != null && r.lng != null
  const hasWebsite = Boolean(r.website_url)

  // CTA priority per spec
  let primaryCTA: { label: string; href: string; event: string } | null = null
  const secondaryCTAs: { label: string; href: string; event: string }[] = []

  if (hasPhone) {
    primaryCTA = { label: `${t('restaurant.call', lang)} · ${r.phone}`, href: `tel:${r.phone}`, event: 'click_call' }
  } else if (hasCoords) {
    primaryCTA = { label: t('restaurant.route', lang), href: googleMapsRoute(r.lat!, r.lng!), event: 'click_route' }
  } else if (hasWebsite) {
    primaryCTA = { label: t('restaurant.menu', lang), href: r.website_url!, event: 'click_menu' }
  }

  if (hasCoords && primaryCTA?.event !== 'click_route') {
    secondaryCTAs.push({ label: t('restaurant.route', lang), href: googleMapsRoute(r.lat!, r.lng!), event: 'click_route' })
  }
  if (hasWebsite && primaryCTA?.event !== 'click_menu') {
    secondaryCTAs.push({ label: t('restaurant.menu', lang), href: r.website_url!, event: 'click_menu' })
  }

  function handleCTA(e: React.MouseEvent, eventName: string, href: string) {
    e.preventDefault()
    trackEvent(eventName, { restaurant_id: r.id, name: r.name })
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  function handleSave() {
    const nowSaved = toggleSave(r.id, r.name)
    setSaved(nowSaved)
  }

  const imageUrl = imgError ? '/images/placeholder-restaurant.jpg' : resolveImage(r)

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
      <button
        id="back-btn"
        onClick={() => navigate(-1)}
        className="text-sm text-zinc-400 hover:text-white transition-colors mb-6 inline-flex items-center gap-1"
      >
        {t('results.back', lang)}
      </button>

      <div className="card relative overflow-hidden">

        {/* ── IMAGE ── */}
        <div className="relative w-full" style={{ height: '240px' }}>
          <img
            src={imageUrl}
            alt={r.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />

          {/* Save ♡ */}
          <button
            id={`save-btn-detail-${r.id}`}
            onClick={handleSave}
            aria-label={saved ? 'Unsave restaurant' : 'Save restaurant'}
            className="absolute top-3 left-3 w-10 h-10 rounded-full bg-zinc-900/70 backdrop-blur-sm flex items-center justify-center text-xl hover:scale-110 transition-transform active:scale-90"
          >
            {saved ? '♥' : '♡'}
          </button>

          {/* Verified */}
          {r.verified && (
            <div className="absolute top-3 right-3">
              <span className="badge-verified text-[11px] px-2 py-0.5">
                ✓ {t('card.verified', lang)}
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Cuisine + city + price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {r.cuisine_primary && (
                <span className="badge badge-orange">{r.cuisine_primary}</span>
              )}
              {r.vibe && (
                <span className="badge badge-zinc capitalize">{r.vibe}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {r.city && (
                <span className="text-sm text-zinc-500">📍 {r.city}</span>
              )}
              <span className="text-sm font-bold text-brand-400">
                {priceLabel(r.price_range ?? 2)}
              </span>
            </div>
          </div>

          {/* Name */}
          <h1 className="text-2xl font-extrabold text-white mb-4 leading-tight">
            {r.name}
          </h1>

          {/* Address */}
          {r.address && (
            <p className="text-sm text-zinc-500 mb-2 flex items-start gap-1.5">
              <span className="shrink-0">📍</span>
              {r.address}
            </p>
          )}

          {/* Opening hours */}
          {r.opening_hours && (
            <div className="flex items-start gap-2 mb-4">
              <span className="text-base leading-none mt-0.5 shrink-0">🕐</span>
              <p className="text-sm text-zinc-300 leading-relaxed">{r.opening_hours}</p>
            </div>
          )}

          {/* Notes / description */}
          {r.notes && (
            <p className="text-sm text-zinc-300 mb-6 leading-relaxed whitespace-pre-line">
              {r.notes}
            </p>
          )}

          {/* ── SMART CTA BUTTONS ── */}
          <div className="space-y-3 mb-6">
            {primaryCTA && (
              <a
                id={`cta-primary-${r.id}`}
                href={primaryCTA.href}
                onClick={(e) => handleCTA(e, primaryCTA!.event, primaryCTA!.href)}
                className="btn-primary w-full py-4 text-base text-center block rounded-xl"
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
                    className="btn-secondary flex-1 py-3 rounded-xl text-sm text-center"
                  >
                    {cta.label}
                  </a>
                ))}
              </div>
            )}

            {!primaryCTA && (
              <p className="text-center text-zinc-500 text-sm py-4">
                {t('restaurant.notAvailable', lang)}
              </p>
            )}
          </div>

          {/* Legal note */}
          <div className="border border-brand-500/20 bg-brand-500/5 rounded-xl px-4 py-3">
            <p className="text-xs text-brand-400/80 leading-relaxed whitespace-pre-line text-center">
              {t('restaurant.legalNote', lang)}
            </p>
          </div>
        </div>
      </div>

      {/* Own this restaurant? */}
      <div className="mt-4 text-center">
        <p className="text-xs text-zinc-600">
          Own this restaurant?{' '}
          <Link
            to={`/partners?type=update&name=${encodeURIComponent(r.name)}&id=${r.id}`}
            className="text-brand-400 hover:underline"
          >
            Update information
          </Link>
        </p>
      </div>
    </main>
  )
}
