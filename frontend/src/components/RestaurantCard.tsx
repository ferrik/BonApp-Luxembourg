import type { Restaurant } from '../types'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'
import { Link } from 'react-router-dom'

interface Props {
  restaurant: Restaurant
  rank?: number // 1 | 2 | 3
}

/** Generate a "Best for:" blurb from restaurant data */
function bestForBlurb(r: Restaurant): string {
  const parts: string[] = []

  if (r.direct_ordering) parts.push('direct online ordering')
  else if (r.own_delivery && r.delivery_fee_eur != null && r.delivery_fee_eur <= 2.5)
    parts.push('low delivery fee')
  else if (r.pickup && !r.own_delivery)
    parts.push('pickup option')
  else if (r.own_delivery)
    parts.push('quick delivery')

  if (r.min_order_eur != null && r.min_order_eur <= 12)
    parts.push('low minimum order')

  if (r.city) parts.push(`in ${r.city}`)

  if (parts.length === 0) return r.city ? `local pick in ${r.city}` : 'local pick'
  return parts.join(', ')
}

export default function RestaurantCard({ restaurant: r, rank }: Props) {
  const { lang } = useLang()

  const badges: string[] = []
  if (r.own_delivery)    badges.push(t('restaurant.delivery', lang))
  if (r.pickup)          badges.push(t('restaurant.pickup', lang))
  if (r.direct_ordering) badges.push(t('restaurant.ordering', lang))

  const blurb = bestForBlurb(r)

  return (
    <Link
      to={`/restaurants/${r.id}`}
      id={`restaurant-card-${r.id}`}
      className="card block group relative overflow-hidden"
    >
      {/* Test ribbon */}
      {(r.name.toLowerCase().includes('test') || r.name.toLowerCase().includes('тест') || r.partner_status === 'trial') && (
        <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 z-10 pointer-events-none">
          <div className="absolute top-4 -right-8 bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-bold py-1 w-32 text-center transform rotate-45 shadow-sm border-y border-red-500/30 uppercase tracking-widest">
            ТЕСТ
          </div>
        </div>
      )}
      {/* Rank strip with gradient */}
      <div className="h-1.5 bg-gradient-to-r from-brand-500 to-brand-400" />

      <div className="p-5">
        {/* Rank + cuisine + city */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {rank != null && (
              <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                {rank}
              </span>
            )}
            <span className="badge badge-orange">
              {r.cuisine_primary ?? 'Other'}
            </span>
          </div>
          {r.city && (
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              📍 {r.city}
            </span>
          )}
        </div>

        {/* Name */}
        <h2 className="text-base font-bold text-white mb-1.5 group-hover:text-brand-400 transition-colors leading-snug">
          {r.name}
        </h2>

        {/* Best for blurb */}
        <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
          <span className="text-brand-400 font-semibold">{t('restaurant.bestFor', lang)}</span>{' '}
          {blurb}
        </p>

        {/* Service badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {badges.map((b) => (
              <span key={b} className="badge badge-green">{b}</span>
            ))}
          </div>
        )}

        {/* Min order / fee / CTA row */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            {r.min_order_eur != null && (
              <span>Min <strong className="text-zinc-300">€{r.min_order_eur}</strong></span>
            )}
            {r.delivery_fee_eur != null && (
              <span>Fee <strong className="text-zinc-300">€{r.delivery_fee_eur}</strong></span>
            )}
          </div>
          <span className="text-xs font-semibold text-brand-400 group-hover:underline">
            {t('restaurant.viewDetail', lang)} →
          </span>
        </div>
      </div>
    </Link>
  )
}
