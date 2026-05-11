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
    <main className="flex-1 pb-20">
      {/* ── HEADER ── */}
      <div className="relative w-full h-[40svh] sm:h-[500px] bg-zinc-900 overflow-hidden">
        <img
          src={imageUrl}
          alt={r.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        
        {/* Navigation Overlays */}
        <div className="absolute inset-0 z-10 container pt-8 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-zinc-950/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-zinc-950 transition-all shadow-2xl"
            >
              ←
            </button>
            <button
              onClick={handleSave}
              className={`w-12 h-12 rounded-2xl backdrop-blur-md border border-white/10 flex items-center justify-center text-xl transition-all shadow-2xl ${
                saved ? 'bg-brand-500 text-white border-brand-400' : 'bg-zinc-950/60 text-white'
              }`}
            >
              {saved ? '♥' : '♡'}
            </button>
          </div>
        </div>

        {/* Floating Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 container pb-10">
          <div className="max-w-3xl">
             <div className="flex flex-wrap items-center gap-3 mb-4">
                {r.verified && (
                  <span className="bg-brand-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-lg shadow-brand-500/25">
                    ✓ {t('card.verified', lang)}
                  </span>
                )}
                {r.cuisine_primary && (
                  <span className="bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border border-white/10">
                    {r.cuisine_primary}
                  </span>
                )}
                <span className="bg-zinc-900/80 backdrop-blur-md text-brand-400 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border border-white/10">
                  {priceLabel(r.price_range ?? 2)}
                </span>
             </div>
             <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight mb-4">
                {r.name}
             </h1>
             {r.city && (
               <p className="text-zinc-300 text-lg font-bold flex items-center gap-2">
                 <span className="text-brand-500">📍</span> {r.city}
               </p>
             )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="container py-12 grid lg:grid-cols-[1fr_400px] gap-16">
        
        {/* Left Column: Details */}
        <div className="space-y-12">
          {r.notes && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6">{t('restaurant.notes', lang)}</h2>
              <p className="text-xl text-zinc-300 leading-relaxed whitespace-pre-line font-medium">
                {r.notes}
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-12 pt-8 border-t border-zinc-900">
             {r.address && (
               <div>
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">{t('restaurant.address', lang)}</h3>
                 <p className="text-white font-bold leading-relaxed">{r.address}</p>
               </div>
             )}
             {r.opening_hours && (
               <div>
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">{t('restaurant.hours', lang)}</h3>
                 <p className="text-zinc-300 leading-relaxed whitespace-pre-line text-sm">{r.opening_hours}</p>
               </div>
             )}
          </div>
        </div>

        {/* Right Column: Actions / Stickies */}
        <div className="space-y-6">
           <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 sticky top-32">
              <h3 className="text-white font-black text-xl mb-8">Contact & Visit</h3>
              
              <div className="space-y-4">
                {primaryCTA && (
                  <a
                    id={`cta-primary-${r.id}`}
                    href={primaryCTA.href}
                    onClick={(e) => handleCTA(e, primaryCTA!.event, primaryCTA!.href)}
                    className="btn-pick-for-me flex items-center justify-center !max-w-none shadow-brand-500/10"
                  >
                    {primaryCTA.label}
                  </a>
                )}

                {secondaryCTAs.map((cta) => (
                  <a
                    key={cta.event}
                    id={`cta-${cta.event.replace('click_', '')}-${r.id}`}
                    href={cta.href}
                    onClick={(e) => handleCTA(e, cta.event, cta.href)}
                    className="btn-secondary w-full py-4 rounded-2xl text-base font-bold"
                  >
                    {cta.label}
                  </a>
                ))}

                {!primaryCTA && (
                  <p className="text-center text-zinc-500 text-sm py-4">
                    {t('restaurant.notAvailable', lang)}
                  </p>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-800/50">
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center leading-relaxed">
                   {t('restaurant.legalNote', lang)}
                 </p>
              </div>
           </div>

           <div className="text-center">
              <Link
                to={`/partners?type=update&name=${encodeURIComponent(r.name)}&id=${r.id}`}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-brand-400 transition-colors"
              >
                Update information
              </Link>
           </div>
        </div>
      </div>
    </main>
  )
}
