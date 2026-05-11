import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'
import { fetchRestaurants, trackEvent } from '../lib/api'
import type { Restaurant, Scenario } from '../types'
import RestaurantCard from '../components/RestaurantCard'

const SCENARIOS: { key: Scenario; icon: string }[] = [
  { key: 'dinner', icon: '🍽' },
  { key: 'coffee', icon: '☕' },
  { key: 'drinks', icon: '🍷' },
  { key: 'quick', icon: '⚡' },
]

const STATIC_CITIES = [
  'Luxembourg City', 'Esch-sur-Alzette', 'Differdange',
  'Dudelange', 'Ettelbruck', 'Diekirch', 'Echternach',
  'Wiltz', 'Remich', 'Grevenmacher',
]

const HOW_IT_WORKS = [
  { step: '1', titleKey: 'howItWorks.step1', hintKey: 'howItWorks.step1.hint', icon: '🎯' },
  { step: '2', titleKey: 'howItWorks.step2', hintKey: 'howItWorks.step2.hint', icon: '📍' },
  { step: '3', titleKey: 'howItWorks.step3', hintKey: 'howItWorks.step3.hint', icon: '📞' },
]

function getSavedIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem('bonapp_saved') || '[]')
  } catch { return [] }
}

function SkeletonCard() {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[32px] overflow-hidden h-full flex flex-col">
      <div className="skeleton w-full h-[240px]" />
      <div className="p-6 space-y-4">
        <div className="skeleton h-6 w-2/3" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-16 w-full rounded-2xl" />
      </div>
    </div>
  )
}

interface PickForMeSheetProps {
  onClose: () => void
  onConfirm: (groupSize: number, budget: number) => void
  lang: 'en' | 'fr' | 'lb'
}

function PickForMeSheet({ onClose, onConfirm, lang }: PickForMeSheetProps) {
  const [groupSize, setGroupSize] = useState<number | null>(null)
  const [budget, setBudget] = useState<number | null>(null)

  const groupOptions = [
    { label: t('pickForMe.justMe', lang), value: 1, icon: '👤' },
    { label: t('pickForMe.twoThree', lang), value: 3, icon: '👫' },
    { label: t('pickForMe.fourPlus', lang), value: 4, icon: '👨‍👩‍👦' },
  ]

  const budgetOptions = [
    { label: '€', value: 1, sub: 'Budget' },
    { label: '€€', value: 2, sub: 'Mid' },
    { label: '€€€', value: 3, sub: 'Premium' },
  ]

  function handleConfirm() {
    const selectedGroup = groupSize ?? 1
    const selectedBudget = budget ?? 2
    trackEvent('group_size_selected', { size: selectedGroup })
    trackEvent('budget_selected', { budget: selectedBudget })
    onConfirm(selectedGroup, selectedBudget)
  }

  return (
    <div className="bottom-sheet-overlay !bg-zinc-950/80 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bottom-sheet !max-w-md !p-8 !rounded-[32px] shadow-2xl shadow-black">
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8" />
        <h2 className="text-3xl font-black text-white mb-10 text-center tracking-tight">{t('pickForMe.title', lang)}</h2>

        <div className="space-y-8 mb-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">{t('pickForMe.howMany', lang)}</p>
            <div className="grid grid-cols-3 gap-3">
              {groupOptions.map(({ label, value, icon }) => (
                <button
                  key={value}
                  onClick={() => setGroupSize(value)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all active:scale-95 ${
                    groupSize === value ? 'border-brand-500 bg-brand-500/10' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xl" aria-hidden="true">{icon}</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${groupSize === value ? 'text-white' : 'text-zinc-500'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">{t('pickForMe.budget', lang)}</p>
            <div className="grid grid-cols-3 gap-3">
              {budgetOptions.map(({ label, value, sub }) => (
                <button
                  key={value}
                  onClick={() => setBudget(value)}
                  className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border transition-all active:scale-95 ${
                    budget === value ? 'border-brand-500 bg-brand-500/10' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  }`}
                >
                  <span className={`text-xl font-black ${budget === value ? 'text-brand-500' : 'text-white'}`}>{label}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${budget === value ? 'text-white' : 'text-zinc-600'}`}>
                    {sub}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleConfirm} 
          className="btn-pick-for-me !h-[72px] !text-xl !max-w-none shadow-brand-500/20"
        >
          {t('pickForMe.show', lang)}
        </button>
      </div>
    </div>
  )
}

const FALLBACK_RESTAURANTS: Restaurant[] = [
  {
    id: -1,
    name: 'Tempo Bar sous la Philharmonie',
    city: 'Luxembourg City',
    cuisine_primary: 'French / Mediterranean',
    image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
    notes: 'Cozy atmosphere with great wine selection next to the Philharmonie.',
    price_range: 3,
    lat: 49.618,
    lng: 6.139,
    phone: '+352 26 27 02 44',
    website_url: 'https://www.tempobar.lu',
    verification_status: 'verified',
    partner_status: 'active'
  },
  {
    id: -2,
    name: 'Bao8',
    city: 'Luxembourg City',
    cuisine_primary: 'Asian / Dim Sum',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    notes: 'Fast, fresh and authentic Asian flavors in the heart of the city.',
    price_range: 2,
    lat: 49.611,
    lng: 6.130,
    phone: '+352 26 20 18 88',
    website_url: 'https://www.bao8.lu',
    verification_status: 'verified'
  },
  {
    id: -3,
    name: 'Pizzeria Onesto',
    city: 'Luxembourg City',
    cuisine_primary: 'Italian / Pizza',
    image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
    notes: 'Traditional wood-fired pizzas with a cozy terrace for summer nights.',
    price_range: 2,
    lat: 49.612,
    lng: 6.132,
    phone: '+352 22 25 10',
    website_url: 'https://www.onesto.lu',
    verification_status: 'verified'
  }
]

export default function HomePage() {
  const navigate = useNavigate()
  const { lang } = useLang()

  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [city, setCity] = useState(() => sessionStorage.getItem('bonapp_city') || '')
  const [showSheet, setShowSheet] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  const savedIds = getSavedIds()

  useEffect(() => {
    setLoading(true)
    fetchRestaurants({ city: city || undefined, scenario: scenario || undefined })
      .then(data => {
        if (data && data.length > 0) {
          setRestaurants(data.slice(0, 3))
        } else {
          setRestaurants(FALLBACK_RESTAURANTS)
        }
      })
      .catch(() => setRestaurants(FALLBACK_RESTAURANTS))
      .finally(() => setLoading(false))
  }, [city, scenario])

  function goToResults(nextScenario?: Scenario, groupSize?: number, budget?: number) {
    const url = new URLSearchParams()
    if (nextScenario) url.set('scenario', nextScenario)
    if (city) url.set('city', city)
    if (budget) url.set('price_range', String(budget))
    if (groupSize) url.set('group_size', String(groupSize))
    if (!nextScenario) url.set('surprise', '1')
    navigate(`/results?${url.toString()}`)
  }

  function handleScenario(s: Scenario) {
    setScenario(s)
    trackEvent('scenario_selected', { scenario: s })
  }

  function handleCityChange(c: string) {
    setCity(c)
    sessionStorage.setItem('bonapp_city', c)
    if (c) trackEvent('city_selected', { city: c })
  }

  function handlePickForMe() {
    trackEvent('pick_for_me_clicked', {})
    setShowSheet(true)
  }

  function handleSheetConfirm(groupSize: number, budget: number) {
    setShowSheet(false)
    goToResults(scenario ?? undefined, groupSize, budget)
  }

  return (
    <main className="flex-1 flex flex-col">
      {showSheet && <PickForMeSheet onClose={() => setShowSheet(false)} onConfirm={handleSheetConfirm} lang={lang} />}

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-zinc-950 border-b border-zinc-900">
        <div className="absolute inset-0 z-0 lg:hidden">
           <img 
             src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80" 
             className="w-full h-full object-cover opacity-20"
             alt="Vibe"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />
        </div>

        <div className="relative z-10 container grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-center min-h-[85svh] lg:min-h-[800px] py-20">
          
          {/* Left Side: Copy & Dominant CTA */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 className="text-[44px] sm:text-[56px] lg:text-[88px] font-black text-white leading-[0.95] mb-10 tracking-tighter max-w-[700px]">
              {t('home.tagline', lang)}
            </h1>
            <p className="text-xl sm:text-2xl text-zinc-400 mb-14 max-w-lg font-medium leading-relaxed">
              {t('home.subtitle', lang)}
            </p>

            <button 
              id="hero-cta-main" 
              onClick={handlePickForMe} 
              className="btn-pick-for-me mb-16 group"
            >
              {t('home.pickForMe', lang)}
            </button>

            {/* Social Proof Strip */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-10 gap-y-4 mb-10 opacity-30">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-3">
                <span className="text-xl">🏪</span> {t('home.socialLocal', lang)}
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-3">
                <span className="text-xl">📞</span> {t('home.socialNoApps', lang)}
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-3">
                <span className="text-xl">✓</span> {t('home.curated', lang)}
              </span>
            </div>
          </div>

          {/* Right Side: Emotional Collage */}
          <div className="hidden lg:grid grid-cols-2 gap-6 h-[650px] transform rotate-3 scale-105 origin-center">
            <div className="space-y-6">
              <img 
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80" 
                className="w-full h-[360px] object-cover rounded-[48px] shadow-2xl border-8 border-zinc-900 hover:scale-105 transition-transform duration-700 ease-out cursor-pointer"
                alt="Restaurant Table Atmosphere"
              />
              <img 
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80" 
                className="w-full h-[260px] object-cover rounded-[48px] shadow-2xl border-8 border-zinc-900 hover:scale-105 transition-transform duration-700 ease-out cursor-pointer"
                alt="Delicious Pizza Oven"
              />
            </div>
            <div className="space-y-6 pt-16">
              <img 
                src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80" 
                className="w-full h-[260px] object-cover rounded-[48px] shadow-2xl border-8 border-zinc-900 hover:scale-105 transition-transform duration-700 ease-out cursor-pointer"
                alt="Evening Cocktails Bar"
              />
              <img 
                src="https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80" 
                className="w-full h-[360px] object-cover rounded-[48px] shadow-2xl border-8 border-zinc-900 hover:scale-105 transition-transform duration-700 ease-out cursor-pointer"
                alt="Gourmet Dessert Atmosphere"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── TONIGHT IN LUXEMBOURG ── */}
      <section id="tonight" className="container py-20 sm:py-32">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-[2px] bg-brand-500" />
              <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em]">Haut den Owend</span>
            </div>
            <h2 className="text-[40px] sm:text-[56px] font-black text-white mb-4 tracking-tighter leading-none">
              {t('home.tonightTitle', lang)}
            </h2>
            <p className="text-xl text-zinc-500 font-bold">{t('home.tonightSubtitle', lang)}</p>
          </div>
          <button 
            onClick={() => goToResults(scenario ?? undefined)} 
            className="group flex items-center gap-4 text-white font-black uppercase tracking-widest text-xs hover:text-brand-400 transition-colors"
          >
            {t('results.showAll', lang)} 
            <span className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-brand-500 group-hover:translate-x-2 transition-all">→</span>
          </button>
        </div>

        {loading ? (
          <div className="results-grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="results-grid">
            {restaurants.map((r, i) => (
              <RestaurantCard 
                key={r.id} 
                restaurant={r} 
                rank={i + 1} 
              />
            ))}
          </div>
        )}
      </section>

      {/* ── SCENARIOS & CITIES ── */}
      <section className="bg-zinc-900/40 border-y border-zinc-900 py-24">
        <div className="container grid lg:grid-cols-2 gap-20">
          <div>
            {/* Scenarios */}
            <div className="w-full max-w-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Explore by Vibe · Local picks</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SCENARIOS.map(({ key, icon }) => (
                <button
                  key={key}
                  id={`scenario-${key}`}
                  onClick={() => handleScenario(key)}
                  className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[24px] border transition-all active:scale-95 group ${
                    scenario === key ? 'border-brand-500 bg-brand-500/10' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-3xl group-hover:scale-125 transition-transform" aria-hidden="true">{icon}</span>
                  <div className="text-left">
                    <span className="block text-sm font-black text-white uppercase tracking-wider">
                      {t(`scenario.${key}`, lang).replace('🍽 ', '').replace('☕ ', '').replace('🍷 ', '').replace('⚡ ', '')}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">Explore top 3</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-8">Popular in Luxembourg</p>
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[32px] shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl">📍</span>
                <h3 className="text-xl font-black text-white tracking-tight">Browse by city</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {STATIC_CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleCityChange(c)}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      city === c ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SAVED PLACES (CONDITIONAL) ── */}
      {savedIds.length > 0 && (
        <section className="py-12">
          <div className="container">
             <button onClick={() => navigate('/results?saved=1')} className="group inline-flex items-center gap-6 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-6 rounded-[32px] transition-all">
                <span className="w-14 h-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">♥</span>
                <div className="text-left">
                  <p className="text-xl font-black text-white">{t('home.savedPlaces', lang)}</p>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{savedIds.length} {savedIds.length === 1 ? 'place' : 'places'} ready for you</p>
                </div>
             </button>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="container py-32">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-[40px] font-black text-white mb-6 tracking-tight">{t('howItWorks.title', lang)}</h2>
          <div className="w-20 h-1.5 bg-brand-500 mx-auto rounded-full" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="group p-10 rounded-[40px] bg-zinc-900/30 border border-zinc-800 hover:border-brand-500/30 transition-all text-center">
              <div className="w-20 h-20 rounded-3xl bg-zinc-800 flex items-center justify-center text-4xl mb-8 mx-auto group-hover:scale-110 group-hover:bg-brand-500/10 group-hover:text-brand-500 transition-all">
                {step.icon}
              </div>
              <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{t(step.titleKey, lang)}</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">{t(step.hintKey, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOR RESTAURANTS ── */}
      <section className="container py-20">
        <div className="relative overflow-hidden bg-brand-500 rounded-[48px] p-12 sm:p-20 flex flex-col items-center text-center">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl sm:text-6xl font-black text-zinc-950 mb-6 tracking-tighter leading-none">
              {t('forRestaurants.title', lang)}
            </h2>
            <p className="text-xl text-zinc-900 font-bold mb-10 leading-relaxed">
              {t('forRestaurants.body', lang)}
            </p>
            <button 
              onClick={() => navigate('/partners')}
              className="bg-zinc-950 text-white h-[72px] px-12 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
            >
              {t('forRestaurants.cta', lang)}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
