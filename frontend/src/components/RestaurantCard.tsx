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

function mockDistance(restaurantId: number, city?: string): string {
  // Deterministic mock distance based on ID
  const dist = (restaurantId % 15) / 10 + 0.5
  const mins = Math.round(dist * 8)
  return `${mins} min · ${dist.toFixed(1)} km`
}

export default function RestaurantCard({ restaurant: r, rank }: Props) {
  const { lang } = useLang()
  const [imgError, setImgError] = useState(false)

  const imageUrl = imgError ? '/images/placeholder-restaurant.jpg' : resolveImage(r)
  const hasPhone = Boolean(r.phone)
  const hasCoords = r.lat != null && r.lng != null
  const hasWebsite = Boolean(r.website_url || r.delivery_url || r.menu_url)
  const openNow = isOpenNow(r)
  const distance = mockDistance(r.id, r.city)

  function handleAction(e: React.MouseEvent, eventName: string, href: string) {
    e.preventDefault()
    e.stopPropagation()
    trackEvent(eventName, { restaurant_id: r.id, name: r.name })
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return (
    <article 
      onClick={() => window.location.href = `/restaurant/${r.id}`}
      className="group bg-zinc-900/40 border border-zinc-800 rounded-[32px] overflow-hidden hover:border-brand-500/30 transition-all cursor-pointer flex flex-col h-full shadow-lg hover:shadow-brand-500/5"
    >
      {/* Image Container */}
      <div className="relative h-[220px] md:h-[240px] overflow-hidden shrink-0">
        <img 
          src={imageUrl} 
          alt={r.name} 
          onError={() => setImgError(true)} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          loading="lazy" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
        
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {openNow ? (
            <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-xl">
              ● {t('card.openNow', lang)}
            </span>
          ) : (
             <span className="bg-zinc-800/80 backdrop-blur-md text-zinc-400 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
               ○ Closed
             </span>
          )}
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                 <span className="text-white font-black text-lg tracking-tight drop-shadow-md">{r.name}</span>
                 {r.verified && <span className="text-brand-400 text-xs">✓</span>}
              </div>
              <div className="flex items-center gap-2 text-zinc-300 text-[10px] font-bold uppercase tracking-widest opacity-90">
                 <span>{r.cuisine_primary || 'Local'}</span>
                 <span>·</span>
                 <span>{r.city || 'Luxembourg'}</span>
              </div>
           </div>
           <div className="text-right">
              <div className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-1">{distance}</div>
              <div className="text-zinc-400 text-xs font-bold">{priceLabel(r.price_range ?? 2)}</div>
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Vibe / Features */}
        <div className="flex flex-wrap gap-2 mb-4">
           {r.vibe && (
              <span className="bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                ✨ {t(`card.${r.vibe}`, lang)}
              </span>
           )}
           {r.terrace && (
              <span className="bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                ☀️ {t('card.terrace', lang)}
              </span>
           )}
           {r.parking && (
              <span className="bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                🚗 {t('card.parking', lang)}
              </span>
           )}
        </div>

        {r.notes && (
          <p className="text-sm text-zinc-400 line-clamp-2 mb-6 leading-relaxed italic opacity-80">
            "{r.notes}"
          </p>
        )}

        {/* Action Grid - NEW PRIORITY */}
        <div className="mt-auto flex flex-col gap-3">
          {/* PRIMARY: ROUTE */}
          <button 
            onClick={(e) => {
               const url = hasCoords 
                 ? googleMapsRoute(r.lat!, r.lng!) 
                 : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name} ${r.city || 'Luxembourg'}`)}`
               handleAction(e, 'click_route', url)
            }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white transition-all shadow-xl shadow-brand-500/20 active:scale-[0.98] group/route"
          >
            <span className="text-xl group-hover/route:rotate-12 transition-transform">🧭</span>
            <span className="text-xs font-black uppercase tracking-[0.2em]">{t('card.route', lang)}</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            {/* SECONDARY: CALL */}
            <button 
              onClick={(e) => handleAction(e, 'click_call', `tel:${r.phone}`)}
              disabled={!hasPhone}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl border transition-all ${
                hasPhone 
                ? 'bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-800' 
                : 'bg-zinc-900/20 border-zinc-900 text-zinc-700 cursor-not-allowed'
              }`}
            >
              <span className="text-base">📞</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{t('card.call', lang)}</span>
            </button>

            {/* TERTIARY: MENU/WEBSITE */}
            <button 
              onClick={(e) => handleAction(e, 'click_menu', r.menu_url || r.website_url || r.delivery_url || '')}
              disabled={!hasWebsite}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl border transition-all ${
                hasWebsite 
                ? 'bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-800' 
                : 'bg-zinc-900/20 border-zinc-900 text-zinc-700 cursor-not-allowed'
              }`}
            >
              <span className="text-base">📋</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{t('card.menu', lang)}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
