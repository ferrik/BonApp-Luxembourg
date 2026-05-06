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
      <section className="flex flex-col items-center justify-center text-center px-4 pt-14 pb-6">
        {/* Location pill */}
        <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          Restaurant discovery · Luxembourg
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight max-w-xs sm:max-w-md">
          {t('home.tagline', lang)}
        </h1>
        <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
          {t('home.subtitle', lang)}
        </p>
      </section>

      {/* ── SAVED PLACES (if any) ── */}
      {savedIds.length > 0 && (
        <section className="max-w-lg w-full mx-auto px-4 pb-4">
          <button
            onClick={() => navigate('/results?saved=1')}
            className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 hover:border-brand-500/40 transition-colors"
          >
            <span className="text-sm text-zinc-300 font-medium">
              ♥ {t('home.savedPlaces', lang)} ({savedIds.length})
            </span>
            <span className="text-xs text-brand-400">→</span>
          </button>
        </section>
      )}

      {/* ── CITY SELECTOR ── */}
      <section className="max-w-lg w-full mx-auto px-4 pb-5">
        <select
          id="city-selector"
          value={city}
          onChange={(e) => handleCityChange(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="">{t('home.cityLabel', lang)}</option>
          {STATIC_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </section>

      {/* ── MAIN CTA + SCENARIOS ── */}
      <section className="max-w-lg w-full mx-auto px-4 pb-8">

        {/* PRIMARY: Pick for me */}
        <button
          id="pick-for-me-btn"
          onClick={handlePickForMe}
          className="w-full btn-primary py-4 text-base rounded-2xl mb-5 text-lg font-bold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-shadow"
        >
          {t('home.pickForMe', lang)}
        </button>

        {/* Divider */}
        <p className="text-center text-xs text-zinc-500 mb-4 uppercase tracking-widest">
          {t('home.orChoose', lang)}
        </p>

        {/* Scenario grid — 4 chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SCENARIOS.map(({ key, icon }) => (
            <button
              key={key}
              id={`scenario-${key}`}
              onClick={() => handleScenario(key)}
              className={scenario === key ? 'scenario-chip-selected' : 'scenario-chip'}
            >
              <span className="text-3xl leading-none">{icon}</span>
              <span className="text-xs text-center leading-tight">{t(`scenario.${key}`, lang)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-lg w-full mx-auto px-4 pb-8">
        <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/60">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">
            {t('howItWorks.title', lang)}
          </h2>
          <ol className="space-y-4">
            {HOW_IT_WORKS.map(({ step, titleKey, hintKey, icon }) => (
              <li key={step} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {step}
                </span>
                <div>
                  <p className="text-sm text-zinc-200 font-medium">
                    {icon} {t(titleKey, lang)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {t(hintKey, lang)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FOR RESTAURANTS ── */}
      <section className="max-w-lg w-full mx-auto px-4 pb-12">
        <div className="border border-brand-500/20 rounded-2xl p-5 bg-brand-500/5 flex items-start gap-4">
          <span className="text-3xl shrink-0">🏪</span>
          <div>
            <p className="text-sm font-bold text-brand-400 mb-1">
              {t('forRestaurants.title', lang)}
            </p>
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
              {t('forRestaurants.body', lang)}
            </p>
            <Link
              id="cta-join-pilot"
              to="/partners"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              {t('forRestaurants.cta', lang)}
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
