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
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

      {/* Back */}
      <button
        id="back-btn"
        onClick={() => navigate(-1)}
        className="text-sm text-zinc-400 hover:text-white transition-colors mb-5 inline-flex items-center gap-1"
      >
        {t('results.back', lang)}
      </button>

      {/* Title block */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-white mb-1">
          {showSaved ? t('home.savedPlaces', lang) : t('results.title', lang)}
        </h1>
        {scenario && !showSaved && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="badge badge-orange">{scenarioIcon} {scenarioLabel}</span>
            {city && <span className="badge badge-zinc">📍 {city}</span>}
            {priceRange && <span className="badge badge-zinc">{'€'.repeat(priceRange)}</span>}
          </div>
        )}
        {!showSaved && (
          <p className="text-xs text-zinc-500">{t('results.subtitle', lang)}</p>
        )}
      </div>

      {/* ── Loading: 3 shimmer skeletons shown simultaneously ── */}
      {loading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="text-center py-16 text-zinc-400">{error}</div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && displayed.length === 0 && (
        <div className="flex flex-col items-center text-center py-16 gap-4">
          <span className="text-5xl">🍽</span>
          <p className="text-lg font-bold text-white">{t('results.empty', lang)}</p>
          <p className="text-sm text-zinc-400">{t('results.emptyHint', lang)}</p>
          <button
            id="show-all-btn"
            onClick={handleShowAll}
            className="btn-primary py-3 px-6 rounded-xl text-sm"
          >
            {t('results.showAll', lang)}
          </button>
        </div>
      )}

      {/* ── Cards ── */}
      {!loading && !error && displayed.length > 0 && (
        <>
          <div className="space-y-4 mb-5">
            {displayed.map((r, i) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                rank={!showSaved ? i + 1 : undefined}
                selectedScenario={scenario}
              />
            ))}
          </div>

          {/* Change picks */}
          {!showSaved && (
            <button
              id="btn-change-picks"
              onClick={loadPicks}
              className="w-full btn-secondary py-3 text-sm rounded-2xl mb-6"
            >
              {t('results.changePicks', lang)}
            </button>
          )}

          {/* No-ads disclaimer */}
          <div className="flex items-start gap-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <span className="text-lg shrink-0">💡</span>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {t('results.noAds', lang)}
            </p>
          </div>
        </>
      )}
    </main>
  )
}
