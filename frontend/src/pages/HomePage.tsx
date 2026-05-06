import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'
import { trackEvent } from '../lib/api'
import type { Scenario } from '../types'

// Scenario options (replaces food category grid)
const SCENARIOS: { key: Scenario; icon: string }[] = [
  { key: 'dinner',  icon: '🍽' },
  { key: 'coffee',  icon: '☕' },
  { key: 'drinks',  icon: '🍺' },
  { key: 'quick',   icon: '⚡' },
]

// Fixed city list as specified (plus dynamic from DB)
const STATIC_CITIES = [
  'Luxembourg City', 'Esch-sur-Alzette', 'Differdange',
  'Dudelange', 'Ettelbruck', 'Diekirch', 'Echternach',
  'Wiltz', 'Remich', 'Grevenmacher',
]

// How it works — NO scooter
const HOW_IT_WORKS = [
  { step: '1', titleKey: 'howItWorks.step1', hintKey: 'howItWorks.step1.hint', icon: '🔍' },
  { step: '2', titleKey: 'howItWorks.step2', hintKey: 'howItWorks.step2.hint', icon: '📍' },
  { step: '3', titleKey: 'howItWorks.step3', hintKey: 'howItWorks.step3.hint', icon: '📞' },
]

// Read saved places from localStorage
function getSavedIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem('bonapp_saved') || '[]')
  } catch { return [] }
}

interface PickForMeSheetProps {
  scenario: Scenario | null
  onClose: () => void
  onConfirm: (groupSize: number, budget: number) => void
  lang: 'en' | 'fr'
}

function PickForMeSheet({ scenario: _scenario, onClose, onConfirm, lang }: PickForMeSheetProps) {
  const [groupSize, setGroupSize] = useState<number | null>(null)
  const [budget, setBudget] = useState<number | null>(null)

  const groupOptions = [
    { label: t('pickForMe.justMe', lang), value: 1 },
    { label: t('pickForMe.twoThree', lang), value: 3 },
    { label: t('pickForMe.fourPlus', lang), value: 4 },
  ]

  const budgetOptions = [
    { label: '€ Budget', value: 1 },
    { label: '€€ Mid',   value: 2 },
    { label: '€€€ Premium', value: 3 },
  ]

  function handleConfirm() {
    if (groupSize !== null) trackEvent('group_size_selected', { size: groupSize })
    if (budget !== null)    trackEvent('budget_selected', { budget })
    onConfirm(groupSize ?? 1, budget ?? 2)
  }

  return (
    <div
      className="bottom-sheet-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bottom-sheet">
        {/* Handle */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-6" />
        <h2 className="text-lg font-bold text-white mb-6 text-center">
          {t('pickForMe.title', lang)}
        </h2>

        {/* Group size */}
        <p className="text-sm text-zinc-400 mb-3">{t('pickForMe.howMany', lang)}</p>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {groupOptions.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setGroupSize(value)}
              className={`py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                groupSize === value
                  ? 'bg-brand-500 text-white'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-brand-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Budget */}
        <p className="text-sm text-zinc-400 mb-3">{t('pickForMe.budget', lang)}</p>
        <div className="grid grid-cols-3 gap-2 mb-8">
          {budgetOptions.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setBudget(value)}
              className={`py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                budget === value
                  ? 'bg-brand-500 text-white'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-brand-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          id="pick-for-me-confirm"
          onClick={handleConfirm}
          className="btn-primary w-full py-4 text-base rounded-2xl"
        >
          {t('pickForMe.show', lang)}
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { lang } = useLang()

  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [city, setCity] = useState(() => sessionStorage.getItem('bonapp_city') || '')
  const [showSheet, setShowSheet] = useState(false)

  const savedIds = getSavedIds()

  function handleScenario(s: Scenario) {
    setScenario(s)
    trackEvent('scenario_selected', { scenario: s })
    // navigate immediately on scenario tap
    const url = new URLSearchParams()
    url.set('scenario', s)
    if (city) url.set('city', city)
    navigate(`/results?${url.toString()}`)
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
    const url = new URLSearchParams()
    if (scenario) url.set('scenario', scenario)
    if (city) url.set('city', city)
    url.set('price_range', String(budget))
    url.set('group_size', String(groupSize))
    url.set('surprise', '1')
    navigate(`/results?${url.toString()}`)
  }

  return (
    <main className="flex-1 flex flex-col">

      {/* Pick for me bottom sheet */}
      {showSheet && (
        <PickForMeSheet
          scenario={scenario}
          onClose={() => setShowSheet(false)}
          onConfirm={handleSheetConfirm}
          lang={lang}
        />
      )}

      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden flex flex-col items-center sm:items-start text-center sm:text-left px-4 pt-20 pb-16 lg:pt-32 lg:pb-24">
        {/* Background image & gradient */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent sm:bg-gradient-to-r sm:from-zinc-950 sm:via-zinc-950/90 sm:to-transparent"></div>
        
        <div className="relative z-10 max-w-6xl w-full mx-auto">
          {/* Tagline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] max-w-2xl mx-auto sm:mx-0">
            {t('home.tagline', lang)}
          </h1>
          <p className="text-zinc-300 text-base sm:text-lg lg:text-xl max-w-lg mb-10 mx-auto sm:mx-0">
            {t('home.subtitle', lang)}
          </p>

          <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-md border border-zinc-700 p-2 rounded-2xl flex items-center mx-auto sm:mx-0">
            <span className="pl-3 text-brand-500">📍</span>
            <select
              id="city-selector"
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="" className="bg-zinc-900">{t('home.cityLabel', lang)}</option>
              {STATIC_CITIES.map((c) => (
                <option key={c} value={c} className="bg-zinc-900">{c}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── SAVED PLACES (if any) ── */}
      {savedIds.length > 0 && (
        <section className="max-w-6xl w-full mx-auto px-4 -mt-4 mb-8 relative z-20">
          <button
            onClick={() => navigate('/results?saved=1')}
            className="max-w-md flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 hover:border-brand-500/50 transition-colors mx-auto sm:mx-0"
          >
            <span className="text-sm text-zinc-300 font-medium">
              ♥ {t('home.savedPlaces', lang)} ({savedIds.length})
            </span>
            <span className="text-xs text-brand-400 ml-4">→</span>
          </button>
        </section>
      )}

      {/* ── MAIN CTA + SCENARIOS ── */}
      <section className="relative z-20 max-w-6xl w-full mx-auto px-4 pb-16 mt-4">
        
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-4">
          {t('home.orChoose', lang)}
        </p>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch mb-8">
          {/* Scenario grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SCENARIOS.map(({ key, icon }) => (
              <button
                key={key}
                id={`scenario-${key}`}
                onClick={() => handleScenario(key)}
                className={`flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 bg-zinc-900/80 backdrop-blur-md border rounded-2xl p-4 sm:p-5 transition-all text-left ${scenario === key ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/20' : 'border-zinc-700 hover:border-zinc-500'}`}
              >
                <span className="text-3xl sm:text-2xl leading-none text-brand-400">{icon}</span>
                <span className="text-sm font-bold text-white leading-tight mt-1 sm:mt-0">{t(`scenario.${key}`, lang)}</span>
              </button>
            ))}
          </div>

          {/* No Delivery Box */}
          <div className="lg:w-72 shrink-0 bg-zinc-900/80 backdrop-blur-md border border-zinc-700 rounded-2xl p-5 flex items-center gap-4">
            <span className="text-3xl bg-zinc-800 p-2 rounded-xl">🛵</span>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <span className="font-bold text-white block mb-0.5">{t('home.noDeliveryTitle', lang)}</span>
              {t('home.noDeliveryBody', lang)}
            </p>
          </div>
        </div>

        {/* PRIMARY: Pick for me */}
        <button
          id="pick-for-me-btn"
          onClick={handlePickForMe}
          className="btn-primary py-4 px-8 text-base sm:text-lg rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 w-full sm:w-auto min-w-[240px]"
        >
          <span className="text-2xl leading-none bg-white/20 p-1 rounded-md">🎲</span> {t('home.pickForMe', lang)}
        </button>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="max-w-6xl w-full mx-auto px-4 pb-8">
        <div className="border border-zinc-800 rounded-3xl p-6 md:p-8 bg-zinc-950/60 mt-12">
          <h2 className="text-xl font-bold text-white mb-6">
            {t('howItWorks.title', lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Arrows for desktop */}
            <div className="hidden md:block absolute top-6 left-[28%] text-zinc-700">→</div>
            <div className="hidden md:block absolute top-6 left-[62%] text-zinc-700">→</div>
            
            {HOW_IT_WORKS.map(({ step, titleKey, hintKey, icon }) => (
              <div key={step} className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {step}
                  </span>
                  <span className="text-3xl bg-zinc-900 w-12 h-12 rounded-full flex items-center justify-center">{icon}</span>
                </div>
                <div>
                  <p className="text-base text-white font-bold mb-1">
                    {t(titleKey, lang)}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {t(hintKey, lang)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR RESTAURANTS ── */}
      <section id="for-restaurants" className="max-w-6xl w-full mx-auto px-4 pb-16">
        <div className="border border-brand-500/20 rounded-3xl overflow-hidden bg-brand-500/5 flex flex-col md:flex-row items-stretch">
          <div className="md:w-1/3 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center min-h-[200px] md:min-h-full opacity-60"></div>
          <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
            <p className="text-2xl font-bold text-brand-500 mb-3">
              {t('forRestaurants.title', lang)}
            </p>
            <p className="text-base text-zinc-300 mb-6 leading-relaxed max-w-lg">
              {t('forRestaurants.body', lang)}
            </p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm text-zinc-300"><span className="text-brand-500">✓</span> {t('forRestaurants.feat1', lang)}</div>
              <div className="flex items-center gap-2 text-sm text-zinc-300"><span className="text-brand-500">✓</span> {t('forRestaurants.feat2', lang)}</div>
              <div className="flex items-center gap-2 text-sm text-zinc-300"><span className="text-brand-500">✓</span> {t('forRestaurants.feat3', lang)}</div>
            </div>
            <div>
              <Link
                id="cta-join-pilot"
                to="/partners"
                className="inline-block bg-brand-500 hover:bg-brand-400 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                {t('forRestaurants.cta', lang)}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
