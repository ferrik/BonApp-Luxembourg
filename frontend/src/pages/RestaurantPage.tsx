import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

  const badges: string[] = []
  if (restaurant.own_delivery)    badges.push(t('restaurant.delivery', lang))
  if (restaurant.pickup)          badges.push(t('restaurant.pickup', lang))
  if (restaurant.direct_ordering) badges.push(t('restaurant.ordering', lang))

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
      <button
        id="back-btn"
        onClick={() => navigate(-1)}
        className="text-sm text-zinc-400 hover:text-white transition-colors mb-6 inline-flex items-center gap-1"
      >
        {t('results.back', lang)}
      </button>

      <div className="card">
        {/* Header strip */}
        <div className="h-2 bg-gradient-to-r from-brand-500 to-brand-400" />

        <div className="p-6">
          {/* Cuisine + city */}
          <div className="flex items-center justify-between mb-4">
            <span className="badge badge-orange">
              {restaurant.cuisine_primary ?? 'Other'}
            </span>
            {restaurant.city && (
              <span className="text-sm text-zinc-500">{restaurant.city}</span>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-extrabold text-white mb-2 leading-tight">
            {restaurant.name}
          </h1>

          {/* Address */}
          {restaurant.address && (
            <p className="text-sm text-zinc-500 mb-4">{restaurant.address}</p>
          )}

          {/* Service badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {badges.map((b) => (
                <span key={b} className="badge badge-green">{b}</span>
              ))}
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
            {restaurant.min_order_eur != null && (
              <div className="bg-zinc-800 rounded-xl p-3">
                <p className="text-xs text-zinc-500 mb-1">{t('restaurant.minOrder', lang)}</p>
                <p className="font-bold text-white">€{restaurant.min_order_eur}</p>
              </div>
            )}
            {restaurant.delivery_fee_eur != null && (
              <div className="bg-zinc-800 rounded-xl p-3">
                <p className="text-xs text-zinc-500 mb-1">{t('restaurant.deliveryFee', lang)}</p>
                <p className="font-bold text-white">€{restaurant.delivery_fee_eur}</p>
              </div>
            )}
            {restaurant.delivery_zone_notes && (
              <div className="bg-zinc-800 rounded-xl p-3 col-span-2">
                <p className="text-xs text-zinc-500">{restaurant.delivery_zone_notes}</p>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            {(restaurant.delivery_url || restaurant.direct_ordering) && (
              <button
                id={`cta-order-${restaurant.id}`}
                onClick={() => handleCta('order_click', restaurant.delivery_url)}
                className="btn-primary w-full py-4 text-base"
              >
                {t('restaurant.order', lang)}
              </button>
            )}

            {restaurant.phone && (
              <a
                id={`cta-call-${restaurant.id}`}
                href={`tel:${restaurant.phone}`}
                onClick={() => handleCta('call_click', null)}
                className="btn-secondary w-full py-4 text-base text-center"
              >
                {t('restaurant.call', lang)} · {restaurant.phone}
              </a>
            )}

            {restaurant.website_url && (
              <button
                id={`cta-website-${restaurant.id}`}
                onClick={() => handleCta('website_click', restaurant.website_url)}
                className="btn-secondary w-full py-3 text-sm"
              >
                {t('restaurant.website', lang)}
              </button>
            )}
          </div>

          {!restaurant.delivery_url && !restaurant.phone && !restaurant.website_url && (
            <p className="text-center text-zinc-500 text-sm py-4">
              {t('restaurant.notAvailable', lang)}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
