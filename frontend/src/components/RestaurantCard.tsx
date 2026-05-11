import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Restaurant } from '../types'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'
import { trackEvent } from '../lib/api'

interface Props {
  restaurant: Restaurant
  rank?: number
  selectedScenario?: string
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function resolveImage(r: Restaurant, scenario?: string): string {
  if (r.image_url) return r.image_url
  if (r.pexels_url) return r.pexels_url
  const scenarioMap: Record<string, string> = {
    dinner: '/images/placeholder-dinner.jpg',
    coffee: '/images/placeholder-coffee.jpg',
    drinks: '/images/placeholder-drinks.jpg',
    quick: '/images/placeholder-quick.jpg',
  }
  return (scenario && scenarioMap[scenario]) ?? '/images/placeholder-restaurant.jpg'
}

function priceLabel(range: number): string {
  if (range === 1) return '€'
  if (range === 3) return '€€€'
  return '€€'
}

function googleMapsRoute(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

function isOpenNow(r: Restaurant): boolean {
  if (!r.hours) return false
  const now = new Date()
  const day = DAY_KEYS[now.getDay()]
  const value = r.hours[day]
  if (!value || typeof value !== 'string') return false
  const [openRaw, closeRaw] = value.split('-')
  if (!openRaw || !closeRaw) return false
  const open = parseFloat(openRaw.replace(':', '.'))
  const close = parseFloat(closeRaw.replace(':', '.'))
  if (Number.isNaN(open) || Number.isNaN(close)) return false
  const currentHour = now.getHours() + now.getMinutes() / 60
  return currentHour >= open && currentHour < close
}

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

export default function RestaurantCard({ restaurant: r, rank }: Props) {
  const { lang } = useLang()
  const [imgError, setImgError] = useState(false)

  const imageUrl = imgError ? '/images/placeholder-restaurant.jpg' : resolveImage(r)
  const hasPhone = Boolean(r.phone)
  const hasCoords = r.lat != null && r.lng != null
  const hasWebsite = Boolean(r.website_url || r.delivery_url)
  const openNow = isOpenNow(r)

  function handleAction(e: React.MouseEvent, eventName: string, href: string) {
    e.preventDefault()
    e.stopPropagation()
    trackEvent(eventName, { restaurant_id: r.id, name: r.name })
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return (
    <article 
      onClick={() => window.location.href = `/restaurant/${r.id}`}
      className="group bg-zinc-900/40 border border-zinc-800 rounded-[32px] overflow-hidden hover:border-zinc-700 transition-all cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative h-[240px] md:h-[260px] overflow-hidden shrink-0">
        <img 
          src={imageUrl} 
          alt={r.name} 
          onError={() => setImgError(true)} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          loading="lazy" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {openNow && (
            <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-xl shadow-black/20">
              ● {t('card.openNow', lang)}
            </span>
          )}
          {r.verified && (
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-xl shadow-black/20">
              ✓ {t('card.verified', lang)}
            </span>
          )}
        </div>

        {rank != null && (
          <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-brand-500 text-white text-base font-black flex items-center justify-center shadow-2xl shadow-brand-500/40 transform group-hover:scale-110 transition-transform">
            {rank}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="text-xl font-black text-white tracking-tight leading-tight group-hover:text-brand-400 transition-colors">
              {r.name}
            </h3>
            <span className="text-sm font-black text-brand-400 shrink-0">
              {priceLabel(r.price_range ?? 2)}
            </span>
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            {r.cuisine_primary || 'Local'} · {r.city || 'Luxembourg'}
          </p>
        </div>

        {r.notes && (
          <p className="text-sm text-zinc-400 line-clamp-2 mb-6 leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
            "{r.notes}"
          </p>
        )}

        {/* Action Grid */}
        <div className="mt-auto grid grid-cols-3 gap-2">
          {hasCoords ? (
            <button 
              onClick={(e) => handleAction(e, 'click_route', googleMapsRoute(r.lat!, r.lng!))}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-zinc-800/40 hover:bg-zinc-800 transition-colors border border-zinc-700/30 group/btn"
            >
              <span className="text-base group-hover/btn:scale-110 transition-transform">📍</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover/btn:text-zinc-300">{t('card.route', lang)}</span>
            </button>
          ) : <div className="bg-zinc-900/20 rounded-2xl border border-zinc-800/10" />}

          {hasPhone ? (
            <button 
              onClick={(e) => handleAction(e, 'click_call', `tel:${r.phone}`)}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-zinc-800/40 hover:bg-zinc-800 transition-colors border border-zinc-700/30 group/btn"
            >
              <span className="text-base group-hover/btn:scale-110 transition-transform">📞</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover/btn:text-zinc-300">{t('card.call', lang)}</span>
            </button>
          ) : <div className="bg-zinc-900/20 rounded-2xl border border-zinc-800/10" />}

          {hasWebsite ? (
            <button 
              onClick={(e) => handleAction(e, 'click_menu', r.website_url || r.delivery_url || '')}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-brand-500/10 hover:bg-brand-500/20 transition-colors border border-brand-500/20 group/btn"
            >
              <span className="text-base group-hover/btn:scale-110 transition-transform">🍴</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-400 group-hover/btn:text-brand-300">{t('card.menu', lang)}</span>
            </button>
          ) : <div className="bg-zinc-900/20 rounded-2xl border border-zinc-800/10" />}
        </div>
      </div>
    </article>
  )
}
