import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'

export default function Footer() {
  const { lang } = useLang()

  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Disclaimer */}
        <p className="text-center text-xs text-zinc-500 mb-6 leading-relaxed">
          {t('home.disclaimer', lang)}
        </p>

        {/* Legal links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
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
    </footer>
  )
}
