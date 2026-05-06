import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'

export default function Navbar() {
  const { lang, setLang } = useLang()

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🍽️</span>
          <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-brand-400 transition-colors">
            BonApp
          </span>
          <span className="hidden sm:inline text-xs text-zinc-500 ml-1">
            Luxembourg
          </span>
        </Link>

        {/* Language toggle */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          <button
            id="lang-en"
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              lang === 'en'
                ? 'bg-brand-500 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            EN
          </button>
          <button
            id="lang-fr"
            onClick={() => setLang('fr')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              lang === 'fr'
                ? 'bg-brand-500 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            FR
          </button>
        </div>
      </div>

      {/* Tagline stripe */}
      <div className="bg-brand-500/10 border-b border-brand-500/20">
        <p className="text-center text-[10px] text-brand-400 py-1 px-4">
          {t('home.tagline', lang)}
        </p>
      </div>
    </header>
  )
}
