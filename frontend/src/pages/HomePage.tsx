import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'

// Primary categories shown prominently (Ескіз 1 — 5 main + Other)
const PRIMARY_CATS = [
  { key: 'Italian', emoji: '🍕' },
  { key: 'Burger',  emoji: '🍔' },
  { key: 'Kebab',   emoji: '🥙' },
  { key: 'Asian',   emoji: '🍣' },
  { key: 'Indian',  emoji: '🍛' },
  { key: 'Other',   emoji: '🍽️' },
]

const ALL_CATS = ['Italian', 'Asian', 'Burger', 'Kebab', 'Indian', 'Local', 'Healthy', 'Other']

const HOW_IT_WORKS = [
  { step: '1', key: 'howItWorks.step1', icon: '🍽️' },
  { step: '2', key: 'howItWorks.step2', icon: '📍' },
  { step: '3', key: 'howItWorks.step3', icon: '🛵' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { lang } = useLang()

  function handleCategory(cuisine: string) {
    navigate(`/results?cuisine=${encodeURIComponent(cuisine)}`)
  }

  function handlePickForMe() {
    const pick = ALL_CATS[Math.floor(Math.random() * ALL_CATS.length)]
    navigate(`/results?cuisine=${encodeURIComponent(pick)}&surprise=1`)
  }

  return (
    <main className="flex-1 flex flex-col">

      {/* ── HERO ── */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-14 pb-6">
        {/* Location pill */}
        <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          Food discovery in Luxembourg
        </div>

        {/* Two-line headline */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
          {t('home.title', lang)}
        </h1>
        <p className="text-2xl sm:text-3xl font-extrabold text-brand-400 mb-5 leading-tight">
          {t('home.titleAccent', lang)}
        </p>
        <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
          {t('home.subtitle', lang)}
        </p>
      </section>

      {/* ── MAIN CTA + CATEGORIES ── */}
      <section className="max-w-lg w-full mx-auto px-4 pb-8">

        {/* PRIMARY: Pick for me */}
        <button
          id="cat-surprise"
          onClick={handlePickForMe}
          className="w-full btn-primary py-4 text-base rounded-2xl mb-5 text-lg font-bold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-shadow"
        >
          {t('home.pickForMe', lang)}
        </button>

        {/* Divider */}
        <p className="text-center text-xs text-zinc-500 mb-4 uppercase tracking-widest">
          {t('home.orChoose', lang)}
        </p>

        {/* Category grid — 3 cols on mobile, 6 on sm+ */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {PRIMARY_CATS.map(({ key, emoji }) => (
            <button
              key={key}
              id={`cat-${key.toLowerCase()}`}
              onClick={() => handleCategory(key)}
              className="category-chip"
            >
              <span className="text-3xl leading-none">{emoji}</span>
              <span className="text-xs">{t(`cat.${key}`, lang)}</span>
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
          <ol className="space-y-3">
            {HOW_IT_WORKS.map(({ step, key, icon }) => (
              <li key={step} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-400 text-xs font-bold flex items-center justify-center shrink-0">
                  {step}
                </span>
                <span className="text-sm text-zinc-300">
                  {icon} {t(key, lang)}
                </span>
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
            <a
              id="cta-join-pilot"
              href="mailto:hello@bonapp.lu?subject=Join BonApp pilot"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              {t('forRestaurants.cta', lang)}
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
