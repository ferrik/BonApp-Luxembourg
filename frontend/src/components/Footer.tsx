import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'

export default function Footer() {
  const { lang } = useLang()

  return (
    <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 pb-12">
      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-16">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-6 opacity-80">
              <span className="text-3xl">🍽️</span>
              <span className="font-black text-2xl tracking-tighter text-white">BonApp</span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {t('nav.tagline', lang)}
            </p>
          </div>

          <div>
             <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6">{t('nav.home', lang)}</h4>
             <ul className="space-y-4">
               <li><Link to="/" className="text-sm text-zinc-400 hover:text-brand-400 transition-colors">{t('nav.home', lang)}</Link></li>
               <li><a href="/#trending" className="text-sm text-zinc-400 hover:text-brand-400 transition-colors">{t('home.trending', lang)}</a></li>
               <li><Link to="/partners" className="text-sm text-zinc-400 hover:text-brand-400 transition-colors">{t('nav.forRestaurants', lang)}</Link></li>
             </ul>
          </div>

          <div>
             <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6">Legal</h4>
             <ul className="space-y-4">
               <li><Link to="/legal/terms" className="text-sm text-zinc-400 hover:text-brand-400 transition-colors">{t('footer.terms', lang)}</Link></li>
               <li><Link to="/legal/privacy" className="text-sm text-zinc-400 hover:text-brand-400 transition-colors">{t('footer.privacy', lang)}</Link></li>
               <li><Link to="/legal/notice" className="text-sm text-zinc-400 hover:text-brand-400 transition-colors">{t('footer.notice', lang)}</Link></li>
             </ul>
          </div>

          <div>
             <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6">Partners</h4>
             <ul className="space-y-4">
               <li><Link to="/partners" className="text-sm text-zinc-400 hover:text-brand-400 transition-colors">{t('forRestaurants.cta', lang)}</Link></li>
               <li><Link to="/legal/partner-terms" className="text-sm text-zinc-400 hover:text-brand-400 transition-colors">{t('footer.partner', lang)}</Link></li>
             </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{t('footer.copy', lang)}</p>
          <p className="text-[10px] text-zinc-600 max-w-lg md:text-right leading-relaxed italic">
            {t('footer.disclaimer', lang)}
          </p>
        </div>
      </div>
    </footer>
  )
}
