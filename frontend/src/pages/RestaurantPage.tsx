import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { fetchRestaurantById, trackClick } from '../lib/api'
import type { Restaurant } from '../types'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { lang } = useLang()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const rid = Number(id)
    setLoading(true)
    fetchRestaurantById(rid)
      .then((data) => {
        setRestaurant(data)
        // Track page view (fire & forget)
        trackClick({ restaurant_id: rid, event_type: 'restaurant_view' }).catch(() => {})
      })
      .catch(() => setError(t('error.notFound', lang)))
      .finally(() => setLoading(false))
  }, [id, lang])

  function handleCta(event_type: 'order_click' | 'call_click' | 'website_click', url?: string | null) {
    if (!restaurant) return
    trackClick({ restaurant_id: restaurant.id, event_type }).catch(() => {})
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 animate-pulse">
        <div className="h-4 w-24 bg-zinc-800 rounded mb-6" />
        <div className="card p-6">
          <div className="h-2 w-full bg-zinc-800 rounded mb-5" />
          <div className="h-6 w-2/3 bg-zinc-800 rounded mb-4" />
          <div className="h-4 w-1/3 bg-zinc-800 rounded mb-8" />
          <div className="space-y-3">
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

  // ── Smart CTA logic ──
  // Priority: online order URL → call to order (phone) → website
  const hasOnlineOrder = Boolean(r.delivery_url)
  const hasPhone       = Boolean(r.phone)
  const hasWebsite     = Boolean(r.website_url)

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
        {/* Test ribbon */}
        {(r.name.toLowerCase().includes('test') || r.name.toLowerCase().includes('тест') || r.partner_status === 'trial' || r.verification_status !== 'verified') && (
          <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 z-10 pointer-events-none">
            <div className="absolute top-4 -right-8 bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-bold py-1 w-32 text-center transform rotate-45 shadow-sm border-y border-red-500/30 uppercase tracking-widest">
              TEST
            </div>
          </div>
        )}

        {/* Header strip */}
        <div className="h-2 bg-gradient-to-r from-brand-500 to-brand-400" />

        <div className="p-6">
          {/* Cuisine + city */}
          <div className="flex items-center justify-between mb-4">
            <span className="badge badge-orange">
              {r.cuisine_primary ?? 'Other'}
            </span>
            {r.city && (
              <span className="text-sm text-zinc-500 flex items-center gap-1">
                📍 {r.city}
              </span>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-extrabold text-white mb-2 leading-tight">
            {r.name}
          </h1>
          
          <p className="text-brand-400 font-bold mb-4 text-sm">
            {t('restaurant.hook', lang)}
          </p>

          {/* Address */}
          {r.address && (
            <p className="text-sm text-zinc-500 mb-2">{r.address}</p>
          )}

          {/* Opening hours */}
          {r.opening_hours && (
            <div className="flex items-start gap-2 mb-4">
              <span className="text-base leading-none mt-0.5">🕐</span>
              <p className="text-sm text-zinc-300 leading-relaxed">{r.opening_hours}</p>
            </div>
          )}

          {/* Description / Notes */}
          {r.notes && (
            <p className="text-sm text-zinc-300 mb-6 leading-relaxed whitespace-pre-line">
              {r.notes}
            </p>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
            {r.min_order_eur != null && (
              <div className="bg-zinc-800 rounded-xl p-3">
                <p className="text-xs text-zinc-500 mb-1">{t('restaurant.minOrder', lang)}</p>
                <p className="font-bold text-white">€{r.min_order_eur}</p>
              </div>
            )}
            {r.delivery_fee_eur != null && (
              <div className="bg-zinc-800 rounded-xl p-3">
                <p className="text-xs text-zinc-500 mb-1">{t('restaurant.deliveryFee', lang)}</p>
                <p className="font-bold text-white">€{r.delivery_fee_eur}</p>
              </div>
            )}
            {r.delivery_zone_notes && (
              <div className="bg-zinc-800 rounded-xl p-3 col-span-2">
                <p className="text-xs text-zinc-500">{r.delivery_zone_notes}</p>
              </div>
            )}
          </div>

          {/* ── SMART CTA BUTTONS ── */}
          {/* Priority: Call (Phone) -> Order Online (URL) -> Website */}
          <div className="space-y-3">
            
            {/* Case 1: has phone -> "Call to order" as primary */}
            {hasPhone && (
              <a
                id={`cta-call-primary-${r.id}`}
                href={`tel:${r.phone}`}
                onClick={() => handleCta('call_click', null)}
                className="btn-primary w-full py-4 text-base text-center block"
              >
                {t('restaurant.callToOrder', lang)} · {r.phone}
              </a>
            )}

            {/* Case 2: has online order -> "Order online" */}
            {hasOnlineOrder && (
              <button
                id={`cta-order-${r.id}`}
                onClick={() => handleCta('order_click', r.delivery_url)}
                className={hasPhone ? "btn-secondary w-full py-3 text-sm" : "btn-primary w-full py-4 text-base"}
              >
                {t('restaurant.order', lang)}
              </button>
            )}

            {/* Case 3: website */}
            {hasWebsite && (
              <button
                id={`cta-website-${r.id}`}
                onClick={() => handleCta('website_click', r.website_url)}
                className={hasPhone || hasOnlineOrder ? "btn-secondary w-full py-3 text-sm" : "btn-primary w-full py-4 text-base"}
              >
                {t('restaurant.website', lang)}
              </button>
            )}

            {/* No contacts at all */}
            {!hasOnlineOrder && !hasPhone && !hasWebsite && (
              <p className="text-center text-zinc-500 text-sm py-4">
                {t('restaurant.notAvailable', lang)}
              </p>
            )}
          </div>

          {/* ── STRONG PERKS BLOCK ── */}
          <div className="mt-6 flex flex-col gap-2.5 text-sm text-zinc-300 border border-zinc-800 rounded-xl p-5 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 bg-emerald-400/10 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">✓</span> 
              {t('restaurant.perkPhone', lang)}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 bg-emerald-400/10 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">✓</span> 
              {t('restaurant.perkReady', lang)}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 bg-emerald-400/10 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">✓</span> 
              {t('restaurant.perkPay', lang)}
            </div>
          </div>

          {/* Legal note */}
          <div className="mt-6 border border-brand-500/20 bg-brand-500/5 rounded-xl px-4 py-3">
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
