import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchRestaurants } from '../lib/api'
import type { Restaurant } from '../types'
import RestaurantCard from '../components/RestaurantCard'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'

export default function ResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { lang } = useLang()

  const cuisine = searchParams.get('cuisine') ?? ''
  const city = searchParams.get('city') ?? ''
  const isSurprise = searchParams.get('surprise') === '1'

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function loadPicks(cat: string, cityParam: string) {
    setLoading(true)
    setError(null)
    fetchRestaurants({ cuisine: cat, city: cityParam || undefined, limit: 3 })
      .then((data) => setRestaurants(data.slice(0, 3)))
      .catch(() => setError(t('error.loading', lang)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!cuisine) {
      navigate('/')
      return
    }
    loadPicks(cuisine, city)
  }, [cuisine, city, lang, navigate])

  function handleChangePicks() {
    // Re-fetch the same category (shuffle happens server-side or randomly)
    loadPicks(cuisine, city)
  }

  // Emoji for category pill
  const catEmojis: Record<string, string> = {
    Italian: '🍕', Burger: '🍔', Kebab: '🥙', Asian: '🍣',
    Indian: '🍛', Local: '🥘', Healthy: '🥗', Other: '🍽️',
  }
  const catEmoji = catEmojis[cuisine] ?? '🍽️'

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
          {t('results.title', lang)}
        </h1>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="badge badge-orange">{catEmoji} {cuisine}</span>
          {isSurprise && <span className="badge badge-zinc">🎲 Surprise</span>}
        </div>
        <p className="text-xs text-zinc-500">
          {t('results.subtitle', lang)}
        </p>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-1.5 w-full bg-zinc-800 rounded mb-4" />
              <div className="h-4 w-1/3 bg-zinc-800 rounded mb-3" />
              <div className="h-5 w-2/3 bg-zinc-800 rounded mb-2" />
              <div className="h-3 w-1/2 bg-zinc-800 rounded mb-4" />
              <div className="h-3 w-2/3 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-16 text-zinc-400">{error}</div>
      )}

      {!loading && !error && restaurants.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          {t('results.empty', lang)}
        </div>
      )}

      {/* Cards with rank */}
      {!loading && !error && restaurants.length > 0 && (
        <>
          <div className="space-y-4 mb-5">
            {restaurants.map((r, i) => (
              <RestaurantCard key={r.id} restaurant={r} rank={i + 1} />
            ))}
          </div>

          {/* Change my picks */}
          <button
            id="btn-change-picks"
            onClick={handleChangePicks}
            className="w-full btn-secondary py-3 text-sm rounded-2xl mb-6"
          >
            {t('results.changePicks', lang)}
          </button>

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
