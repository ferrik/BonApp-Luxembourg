import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'

const CATEGORIES = [
  { key: 'Italian', emoji: '🍕' },
  { key: 'Asian',   emoji: '🍜' },
  { key: 'Burger',  emoji: '🍔' },
  { key: 'Kebab',   emoji: '🥙' },
  { key: 'Indian',  emoji: '🍛' },
  { key: 'Local',   emoji: '🥘' },
  { key: 'Healthy', emoji: '🥗' },
  { key: 'Other',   emoji: '🍽️' },
]

const ALL_CATS = CATEGORIES.map((c) => c.key)

export default function HomePage() {
  const navigate = useNavigate()
  const { lang } = useLang()

  function handleCategory(cuisine: string) {
    navigate(`/results?cuisine=${encodeURIComponent(cuisine)}`)
  }

  function handleSurprise() {
    const pick = ALL_CATS[Math.floor(Math.random() * ALL_CATS.length)]
    navigate(`/results?cuisine=${encodeURIComponent(pick)}&surprise=1`)
  }

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-16 pb-10">
        <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          Luxembourg · South region
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
          {t('home.title', lang)}
        </h1>
        <p className="text-zinc-400 text-base max-w-xs">
          {t('home.subtitle', lang)}
        </p>
      </section>

      {/* Category grid */}
      <section className="max-w-2xl w-full mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {CATEGORIES.map(({ key, emoji }) => (
            <button
              key={key}
              id={`cat-${key.toLowerCase()}`}
              onClick={() => handleCategory(key)}
              className="category-chip"
            >
              <span className="text-3xl leading-none">{emoji}</span>
              <span>{t(`cat.${key}`, lang)}</span>
            </button>
          ))}
        </div>

        {/* Surprise me */}
        <button
          id="cat-surprise"
          onClick={handleSurprise}
          className="w-full btn-secondary py-4 text-base rounded-2xl border-dashed"
        >
          {t('home.surprise', lang)}
        </button>
      </section>
    </main>
  )
}
