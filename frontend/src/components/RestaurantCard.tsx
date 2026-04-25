import { Link } from 'react-router-dom'
import type { Restaurant } from '../types'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'

interface Props {
  restaurant: Restaurant
}

export default function RestaurantCard({ restaurant }: Props) {
  const { lang } = useLang()

  const badges: string[] = []
  if (restaurant.own_delivery)    badges.push(t('restaurant.delivery', lang))
  if (restaurant.pickup)          badges.push(t('restaurant.pickup', lang))
  if (restaurant.direct_ordering) badges.push(t('restaurant.ordering', lang))

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      id={`restaurant-card-${restaurant.id}`}
      className="card block group"
    >
      {/* Header strip */}
      <div className="h-2 bg-gradient-to-r from-brand-500 to-brand-400" />

      <div className="p-5">
        {/* Cuisine tag + city */}
        <div className="flex items-center justify-between mb-3">
          <span className="badge badge-orange">
            {restaurant.cuisine_primary ?? 'Other'}
          </span>
          {restaurant.city && (
            <span className="text-xs text-zinc-500">{restaurant.city}</span>
          )}
        </div>

        {/* Name */}
        <h2 className="text-base font-bold text-white mb-3 group-hover:text-brand-400 transition-colors leading-snug">
          {restaurant.name}
        </h2>

        {/* Service badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {badges.map((b) => (
              <span key={b} className="badge badge-green">{b}</span>
            ))}
          </div>
        )}

        {/* Min order / fee */}
        <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
          {restaurant.min_order_eur != null && (
            <span>{t('restaurant.minOrder', lang)}: <strong className="text-zinc-300">€{restaurant.min_order_eur}</strong></span>
          )}
          {restaurant.delivery_fee_eur != null && (
            <span>{t('restaurant.deliveryFee', lang)}: <strong className="text-zinc-300">€{restaurant.delivery_fee_eur}</strong></span>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-end">
          <span className="text-xs font-semibold text-brand-400 group-hover:underline">
            {t('restaurant.viewDetail', lang)} →
          </span>
        </div>
      </div>
    </Link>
  )
}
