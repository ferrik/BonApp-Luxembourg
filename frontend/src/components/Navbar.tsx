import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'

export default function Navbar() {
  const { lang, setLang } = useLang()

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="container h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group w-48 shrink-0">
          <span className="text-3xl">🍽️</span>
          <div className="flex flex-col leading-none">
            <span className="font-black text-2xl tracking-tighter text-white group-hover:text-brand-400 transition-colors">
              BonApp
            </span>
            <span className="text-[10px] text-brand-400 tracking-[0.2em] font-black uppercase mt-1">
              Luxembourg
            </span>
          </div>
        </Link>

        {/* Links in center */}
        <div className="hidden lg:flex items-center gap-10">
          <Link to="/" className="text-sm font-bold text-white hover:text-brand-400 transition-colors py-5">{t('nav.home', lang)}</Link>
          <a href="/#tonight" className="text-sm font-bold text-zinc-300 hover:text-white transition-colors py-5">{t('nav.tonight', lang)}</a>
          <Link to="/partners" className="text-sm font-bold text-zinc-300 hover:text-white transition-colors py-5">{t('nav.forRestaurants', lang)}</Link>
        </div>

        {/* Language toggle */}
        <div className="flex items-center justify-end gap-1 w-48">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-inner shadow-black/20">
            {(['en', 'fr', 'lb'] as const).map((l) => (
              <button
                key={l}
                id={`lang-${l}`}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                  lang === l
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 scale-105'
                    : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
