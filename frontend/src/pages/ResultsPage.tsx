import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchRestaurants, fetchRestaurantById, trackEvent } from '../lib/api'
import type { Restaurant } from '../types'
import RestaurantCard from '../components/RestaurantCard'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'

// Shimmer skeleton for 1 card
function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      {/* Image placeholder */}
      <div className="skeleton w-full" style={{ height: '200px' }} />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-3/4" />
        <div className="skeleton h-10 w-full rounded-xl mt-1" />
      </div>
    </div>
  )
}

// Read saved IDs from localStorage
function getSavedIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem('bonapp_saved') || '[]')
  } catch { return [] }
}

export default function ResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { lang } = useLang()

  const scenario   = searchParams.get('scenario') ?? ''
  const city       = searchParams.get('city') ?? ''
  const priceRange = searchParams.get('price_range') ? Number(searchParams.get('price_range')) : undefined
  const groupSize  = searchParams.get('group_size')  ? Number(searchParams.get('group_size'))  : undefined
  const showSaved  = searchParams.get('saved') === '1'

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function loadPicks() {
    setLoading(true)
    setError(null)

    if (showSaved) {
      // Fetch each saved restaurant by ID (no batch endpoint in MVP)
      const ids = getSavedIds()
      if (ids.length === 0) { setRestaurants([]); setLoading(false); return }
      Promise.all(ids.map(id => fetchRestaurantById(id).catch(() => null)))
        .then(results => setRestaurants(results.filter((r): r is Restaurant => r !== null)))
        .catch(() => setError(t('error.loading', lang)))
        .finally(() => setLoading(false))
      return
    }

    fetchRestaurants({
      scenario:    scenario || undefined,
      city:        city || undefined,
      price_range: priceRange,
      group_size:  groupSize,
    })
      .then(data => setRestaurants(data.slice(0, 3)))
      .catch(() => setError(t('error.loading', lang)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!scenario && !showSaved) {
      navigate('/')
      return
    }
    loadPicks()
  }, [scenario, city, priceRange, groupSize, showSaved, lang])

  function handleShowAll() {
    trackEvent('show_more_clicked', {})
    fetchRestaurants({ limit: 3 })
      .then(data => setRestaurants(data.slice(0, 3)))
      .catch(() => {})
  }

  // Scenario label for header
  const scenarioIconMap: Record<string, string> = {
    dinner: '🍽', coffee: '☕', drinks: '🍺', quick: '⚡',
  }
  const scenarioIcon = scenarioIconMap[scenario] ?? '🍽'
  const scenarioLabel = scenario ? t(`scenario.${scenario}`, lang) : t('results.title', lang)

  const displayed = restaurants

  return (
    <main className="flex-1 container py-12">

      {/* Back */}
      <button
        id="back-btn"
        onClick={() => navigate(-1)}
        className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-8 inline-flex items-center gap-2 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('results.back', lang)}
      </button>

      {/* Title block */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
          {showSaved ? t('home.savedPlaces', lang) : t('results.title', lang)}
        </h1>
        {scenario && !showSaved && (
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="badge-orange px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">{scenarioLabel}</span>
            {city && <span className="badge-zinc px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">📍 {city}</span>}
            {priceRange && <span className="badge-zinc px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">{'€'.repeat(priceRange)}</span>}
          </div>
        )}
        {!showSaved && (
          <p className="text-sm text-zinc-500 max-w-xl leading-relaxed">{t('results.subtitle', lang)}</p>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="results-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="text-center py-24 bg-zinc-900/30 rounded-3xl border border-zinc-800 text-zinc-400">{error}</div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && displayed.length === 0 && (
        <div className="flex flex-col items-center text-center py-24 bg-zinc-900/30 rounded-3xl border border-zinc-800 gap-6">
          <span className="text-6xl">🍽</span>
          <div>
            <p className="text-2xl font-black text-white mb-2">{t('results.empty', lang)}</p>
            <p className="text-zinc-400">{t('results.emptyHint', lang)}</p>
          </div>
          <button
            id="show-all-btn"
            onClick={handleShowAll}
            className="btn-primary py-4 px-8 rounded-2xl text-base font-bold"
          >
            {t('results.showAll', lang)}
          </button>
        </div>
      )}

      {/* ── Cards ── */}
      {!loading && !error && displayed.length > 0 && (
        <>
          <div className="results-grid mb-12">
            {displayed.map((r, i) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                rank={!showSaved ? i + 1 : undefined}
                selectedScenario={scenario}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-12 border-t border-zinc-900">
            {/* Change picks */}
            {!showSaved && (
              <button
                id="btn-change-picks"
                onClick={loadPicks}
                className="w-full sm:w-auto btn-secondary px-8 py-4 rounded-2xl text-sm font-bold"
              >
                {t('results.changePicks', lang)}
              </button>
            )}

            {/* No-ads disclaimer */}
            <div className="flex items-start gap-4 max-w-md opacity-40">
              <span className="text-xl shrink-0">💡</span>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-relaxed">
                {t('results.noAds', lang)}
              </p>
            </div>
          </div>
        </>
      )}
    </main>
  )
}

