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
  const isSurprise = searchParams.get('surprise') === '1'

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cuisine) {
      navigate('/')
      return
    }
    setLoading(true)
    setError(null)
    fetchRestaurants({ cuisine, limit: 3 })
      .then((data) => setRestaurants(data.slice(0, 3)))
      .catch(() => setError(t('error.loading', lang)))
      .finally(() => setLoading(false))
  }, [cuisine, lang, navigate])

  const categoryLabel = cuisine ? `🍽️ ${cuisine}` : ''

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
      {/* Back + title */}
      <div className="mb-6">
        <button
          id="back-btn"
          onClick={() => navigate(-1)}
          className="text-sm text-zinc-400 hover:text-white transition-colors mb-3 inline-flex items-center gap-1"
        >
          {t('results.back', lang)}
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-white">
            {t('results.title', lang)}
          </h1>
          {categoryLabel && (
            <span className="badge badge-orange">{categoryLabel}</span>
          )}
          {isSurprise && (
            <span className="badge badge-zinc">🎲 Surprise</span>
          )}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-2 w-full bg-zinc-800 rounded mb-4" />
              <div className="h-4 w-1/3 bg-zinc-800 rounded mb-3" />
              <div className="h-5 w-2/3 bg-zinc-800 rounded mb-4" />
              <div className="h-3 w-1/2 bg-zinc-800 rounded" />
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

      {!loading && !error && restaurants.length > 0 && (
        <div className="space-y-4">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}
    </main>
  )
}
