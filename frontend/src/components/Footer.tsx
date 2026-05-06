import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'

export default function Footer() {
  const { lang } = useLang()

  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Footer Features (4 cols) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 border-b border-zinc-800 pb-12">
          <div className="flex items-start gap-4">
            <span className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center text-xl shrink-0">🎯</span>
            <div>
              <p className="text-white font-bold text-sm mb-1">{t('footer.feat1.title', lang)}</p>
              <p className="text-zinc-500 text-xs">{t('footer.feat1.desc', lang)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xl shrink-0">📞</span>
            <div>
              <p className="text-white font-bold text-sm mb-1">{t('footer.feat2.title', lang)}</p>
              <p className="text-zinc-500 text-xs">{t('footer.feat2.desc', lang)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xl shrink-0">💰</span>
            <div>
              <p className="text-white font-bold text-sm mb-1">{t('footer.feat3.title', lang)}</p>
              <p className="text-zinc-500 text-xs">{t('footer.feat3.desc', lang)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center text-xl shrink-0">📍</span>
            <div>
              <p className="text-white font-bold text-sm mb-1">{t('footer.feat4.title', lang)}</p>
              <p className="text-zinc-500 text-xs">{t('footer.feat4.desc', lang)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Legal links */}
          <nav className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
            {[
              { key: 'footer.terms',   href: '/legal/terms' },
              { key: 'footer.privacy', href: '/legal/privacy' },
              { key: 'footer.notice',  href: '/legal/notice' },
              { key: 'footer.partner', href: '/legal/partner-terms' },
            ].map(({ key, href }) => (
              <Link
                key={key}
                to={href}
                className="text-xs text-zinc-500 hover:text-brand-400 transition-colors"
              >
                {t(key, lang)}
              </Link>
            ))}
          </nav>

          <p className="text-center text-xs text-zinc-600">
            {t('footer.copy', lang)}
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-center md:text-left text-[10px] text-zinc-600 mt-6 pt-6 border-t border-zinc-800/50">
          {t('footer.disclaimer', lang)}
        </p>
      </div>
    </footer>
  )
}
