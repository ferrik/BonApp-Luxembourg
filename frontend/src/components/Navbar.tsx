import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'

export default function Navbar() {
  const { lang, setLang } = useLang()

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group w-48">
          <span className="text-2xl">🍽️</span>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-brand-400 transition-colors">
              BonApp
            </span>
            <span className="text-[10px] text-brand-400 tracking-wider font-bold uppercase mt-0.5">
              Luxembourg
            </span>
          </div>
        </Link>

        {/* Links in center */}
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-sm font-semibold text-brand-400 border-b-2 border-brand-400 py-5">{t('nav.home', lang)}</Link>
          <a href="/#how-it-works" className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors py-5">{t('nav.howItWorks', lang)}</a>
          <Link to="/partners" className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors py-5">{t('nav.forRestaurants', lang)}</Link>
          <a href="/legal/notice" className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors py-5">{t('nav.about', lang)}</a>
        </div>

        {/* Language toggle */}
        <div className="flex items-center justify-end gap-1 w-48">
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
      </div>
    </header>
  )
}
