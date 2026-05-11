import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { t } from '../lib/i18n'
import { submitPartnerApplication } from '../lib/api'
import type { PartnerApplicationPayload } from '../types'

// Cuisine options matching our categories
const CUISINE_OPTIONS = ['Italian', 'Asian', 'Burger', 'Kebab', 'Indian', 'Local', 'Healthy', 'Other']

type AppType = 'join' | 'update'

const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const DAYS_FULL_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAYS_FULL_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

type DaySchedule = { open: boolean; from: string; to: string }
type WeekSchedule = DaySchedule[]

function defaultWeek(): WeekSchedule {
  return Array.from({ length: 7 }, (_, i) => ({
    open: i < 5, // Mon-Fri open by default
    from: '11:00',
    to: '22:00',
  }))
}

function scheduleToString(week: WeekSchedule, daysShort: string[]): string {
  return week
    .map((d, i) => d.open ? `${daysShort[i]}: ${d.from}–${d.to}` : `${daysShort[i]}: Closed`)
    .join(', ')
}

const LABELS = {
  en: {
    pageTitle: 'Get more direct customers in Luxembourg',
    pageSubtitle: 'BonApp helps local restaurants get discovered without high delivery platform commissions.',
    benefit1Title: '0% Commission',
    benefit1Body: 'Keep 100% of your revenue. No hidden fees or transaction cuts.',
    benefit2Title: 'Direct Relationship',
    benefit2Body: 'Customers order directly from you. You own the relationship.',
    benefit3Title: 'Local Presence',
    benefit3Body: 'Be seen by thousands of hungry people in Luxembourg every month.',
    step1: 'Identity',
    step2: 'Service',
    step3: 'Ready',
    tabJoin: 'Add a new restaurant',
    tabUpdate: 'Update my listing',
    updateNotice: "Is your restaurant already listed on BonApp? Request a correction and we'll verify it with you.",
    sectionRestaurant: '1. Restaurant Identity',
    sectionContact: '2. Your Contact Details',
    sectionOnline: '3. Digital Presence',
    sectionDelivery: '4. Service Options',
    sectionHours: '5. Opening Hours',
    sectionNotes: '6. Final Details',
    restaurantName: 'Restaurant name *',
    cuisineType: 'What do you serve?',
    city: 'City / Commune',
    address: 'Full Address',
    contactName: 'Your Name *',
    contactPhone: 'WhatsApp / Phone',
    contactEmail: 'Work Email *',
    websiteUrl: 'Official Website',
    imageUrl: 'High-quality photo (Unsplash or your own)',
    orderingUrl: 'Where can they order online?',
    menuUrl: 'Menu (Website / PDF / Drive)',
    offersDelivery: 'We offer delivery',
    offersPickup: 'We offer pickup',
    deliveryAreas: 'Delivery zones (communes)',
    minOrder: 'Minimum order (€)',
    deliveryFee: 'Delivery fee (€)',
    estDelivery: 'Est. delivery time (min)',
    notes: "Special requests or notes for our team",
    submit: 'Start my free listing',
    submitting: 'Processing…',
    hoursOpen: 'Open',
    hoursClosed: 'Closed',
    hoursFrom: 'From',
    hoursTo: 'To',
    successTitle: 'Welcome to the club! 🎉',
    successMsg: "We've received your application. Our team will verify the details and reach out within 24-48 hours.",
    successBack: 'Back to home',
    required: 'Please fill in all required fields.',
    errorGeneric: 'Something went wrong. Please email us at hello@bonapp.lu',
  },
  fr: {
    pageTitle: 'Obtenez plus de clients directs au Luxembourg',
    pageSubtitle: 'BonApp aide les restaurants locaux à se faire découvrir sans les commissions élevées des plateformes de livraison.',
    benefit1Title: '0% Commission',
    benefit1Body: 'Gardez 100% de vos revenus. Pas de frais cachés ni de prélèvements sur les transactions.',
    benefit2Title: 'Relation Directe',
    benefit2Body: 'Les clients commandent directement chez vous. Vous restez maître de la relation.',
    benefit3Title: 'Découverte Locale',
    benefit3Body: 'Soyez visible par des milliers de personnes affamées au Luxembourg chaque mois.',
    step1: 'Parlez-nous de vous',
    step2: 'Ajoutez votre menu',
    step3: 'Mise en ligne',
    tabJoin: 'Ajouter mon restaurant',
    tabUpdate: 'Mettre à jour une fiche existante',
    updateNotice: 'Votre restaurant est déjà répertorié sur BonApp ? Demandez une correction et nous la vérifierons avec vous.',
    sectionRestaurant: '1. Identité du Restaurant',
    sectionContact: '2. Vos Coordonnées',
    sectionOnline: '3. Présence Numérique',
    sectionDelivery: '4. Options de Service',
    sectionHours: '5. Horaires d\'Ouverture',
    sectionNotes: '6. Détails Finaux',
    restaurantName: 'Nom du restaurant *',
    cuisineType: 'Que servez-vous ?',
    city: 'Ville / Commune',
    address: 'Adresse Complète',
    contactName: 'Votre Nom *',
    contactPhone: 'WhatsApp / Téléphone',
    contactEmail: 'E-mail Professionnel *',
    websiteUrl: 'Site Web Officiel',
    imageUrl: 'Photo de haute qualité (Unsplash ou la vôtre)',
    orderingUrl: 'Où commander en ligne ?',
    menuUrl: 'Menu (Site / PDF / Drive)',
    offersDelivery: 'Nous proposons la livraison',
    offersPickup: 'Nous proposons le retrait',
    deliveryAreas: 'Zones de livraison (communes)',
    minOrder: 'Commande minimum (€)',
    deliveryFee: 'Frais de livraison (€)',
    estDelivery: 'Délai de livraison est. (min)',
    notes: 'Demandes spéciales ou notes pour notre équipe',
    submit: 'Lancer ma fiche gratuite',
    submitting: 'Traitement…',
    hoursOpen: 'Ouvert',
    hoursClosed: 'Fermé',
    hoursFrom: 'De',
    hoursTo: 'À',
    successTitle: 'Bienvenue au club ! 🎉',
    successMsg: 'Nous avons bien reçu votre demande. Notre équipe vérifiera les détails et vous contactera sous 24-48 heures.',
    successBack: 'Retour à l\'accueil',
    required: 'Veuillez remplir tous les champs obligatoires.',
    errorGeneric: 'Une erreur s\'est produite. Écrivez-nous à hello@bonapp.lu',
  },
  lb: {
    pageTitle: 'Kritt méi direkt Clienten zu Lëtzebuerg',
    pageSubtitle: 'BonApp hëlleft lokale Restauranten entdeckt ze ginn ouni héich Liwwerkommissiounen.',
    benefit1Title: '0% Kommissioun',
    benefit1Body: 'Behalt 100% vun dengem Ëmsaz. Keng verstoppte Käschten.',
    benefit2Title: 'Direkt Relatioun',
    benefit2Body: 'Clienten bestellen direkt bei dir. Du behals d\'Kontroll.',
    benefit3Title: 'Präsenz',
    benefit3Body: 'Gëff vu ville Leit zu Lëtzebuerg all Mount gesinn.',
    step1: 'Identitéit',
    step2: 'Service',
    step3: 'Fäerdeg',
    tabJoin: 'Neie Restaurant dobäisetzen',
    tabUpdate: 'Mäi Rekord aktualiséieren',
    updateNotice: "Ass Äre Restaurant scho bei BonApp? Frot eng Korrektur un a mir kontrolléieren se mat Iech.",
    sectionRestaurant: '1. Restaurant Identitéit',
    sectionContact: '2. Deng Kontaktdetailer',
    sectionOnline: '3. Digital Präsenz',
    sectionDelivery: '4. Service Optiounen',
    sectionHours: '5. Auerzäiten',
    sectionNotes: '6. Final Detailer',
    restaurantName: 'Numm vum Restaurant *',
    cuisineType: 'Wat bitt dir un?',
    city: 'Stad / Gemeng',
    address: 'Vollstänneg Adress',
    contactName: 'Däin Numm *',
    contactPhone: 'WhatsApp / Telefon',
    contactEmail: 'Aarbechts E-Mail *',
    websiteUrl: 'Offiziell Websäit',
    imageUrl: 'Bild URL (Unsplash oder däint)',
    orderingUrl: 'Bestelllink',
    menuUrl: 'Menülink (Websäit / PDF / Drive)',
    offersDelivery: 'Mir bidden Liwwerung un',
    offersPickup: 'Mir bidden Ofhuelen un',
    deliveryAreas: 'Liwwergebidder (Gemengen)',
    minOrder: 'Min. Bestellung (€)',
    deliveryFee: 'Liwwerkäschten (€)',
    estDelivery: 'Liwwerzäit (Minutten)',
    notes: 'Zousätzlech Notizen',
    submit: 'Mäi gratis Rekord starten',
    submitting: 'Gëtt geschéckt…',
    hoursOpen: 'Op',
    hoursClosed: 'Zou',
    hoursFrom: 'Vun',
    hoursTo: 'Bis',
    successTitle: 'Wëllkomm am Club! 🎉',
    successMsg: 'Mir hunn deng Demande kritt. Eist Team iwwerpréift d\'Detailer a kontaktéiert dech bannent 24-48 Stonnen.',
    successBack: 'Heem',
    required: 'Fëllt w.e.g. all obligatoresch Felder aus.',
    errorGeneric: 'Eppes ass schif gaangen. Schreift eis op hello@bonapp.lu',
  },
}

function SectionTitle({ children, num }: { children: React.ReactNode; num: string }) {
  return (
    <div className="flex items-center gap-3 mb-8 border-b border-zinc-900 pb-5">
      <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center font-black text-xs">
        {num}
      </span>
      <h2 className="text-lg font-black text-white tracking-tight">
        {children}
      </h2>
    </div>
  )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 ml-0.5">
        {label} {required && <span className="text-brand-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all shadow-inner'
const checkboxCls = 'w-5 h-5 accent-brand-500 rounded-lg cursor-pointer'

export default function PartnersPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const L = (LABELS as any)[lang] || LABELS.en

  const [appType, setAppType] = useState<AppType>('join')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  // Form state
  const [restaurantName, setRestaurantName] = useState('')
  const [cuisineType, setCuisineType]       = useState<string[]>([])
  const [city, setCity]                     = useState('')
  const [address, setAddress]               = useState('')
  const [contactName, setContactName]       = useState('')
  const [contactPhone, setContactPhone]     = useState('')
  const [contactEmail, setContactEmail]     = useState('')
  const [websiteUrl, setWebsiteUrl]         = useState('')
  const [imageUrl, setImageUrl]             = useState('')
  const [orderingUrl, setOrderingUrl]       = useState('')
  const [menuUrl, setMenuUrl]               = useState('')
  const [offersDelivery, setOffersDelivery] = useState(false)
  const [offersPickup, setOffersPickup]     = useState(false)
  const [deliveryAreas, setDeliveryAreas]   = useState('')
  const [minOrder, setMinOrder]             = useState('')
  const [deliveryFee, setDeliveryFee]       = useState('')
  const [estDelivery, setEstDelivery]       = useState('')
  const [notes, setNotes]                   = useState('')
  const [schedule, setSchedule]             = useState<WeekSchedule>(defaultWeek)

  function updateDay(i: number, field: keyof DaySchedule, value: boolean | string) {
    setSchedule(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldError(null)

    if (!restaurantName.trim() || !contactName.trim() || !contactEmail.trim()) {
      setFieldError(L.required)
      return
    }

    const payload: PartnerApplicationPayload = {
      application_type: appType,
      restaurant_name: restaurantName.trim(),
      cuisine_type:    cuisineType.length > 0 ? cuisineType.join(', ') : undefined,
      city:            city || undefined,
      address:         address || undefined,
      contact_name:    contactName.trim(),
      contact_phone:   contactPhone || undefined,
      contact_email:   contactEmail.trim(),
      website_url:     websiteUrl || undefined,
      image_url:       imageUrl || undefined,
      ordering_url:    orderingUrl || undefined,
      menu_url:        menuUrl || undefined,
      offers_delivery: offersDelivery,
      offers_pickup:   offersPickup,
      delivery_areas:  deliveryAreas || undefined,
      min_order_eur:   minOrder    ? parseFloat(minOrder)    : null,
      delivery_fee_eur: deliveryFee ? parseFloat(deliveryFee) : null,
      est_delivery_min: estDelivery ? parseInt(estDelivery, 10) : null,
      notes:           notes || undefined,
      opening_hours:   scheduleToString(schedule, lang === 'fr' ? DAYS_FR : DAYS_EN) || undefined,
    }

    setSubmitting(true)
    try {
      await submitPartnerApplication(payload)
      setSubmitted(true)
    } catch {
      setFieldError(L.errorGeneric)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-md w-full text-center">
          <div className="text-7xl mb-8">🎉</div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">{L.successTitle}</h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-10">{L.successMsg}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-pick-for-me !max-w-[280px]"
          >
            {L.successBack}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      
      <div className="max-w-[1600px] mx-auto px-5 lg:px-16 pt-10 lg:pt-24 pb-32">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
          
          {/* ── LEFT SIDE: CONTENT & TRUST ── */}
          <div className="w-full lg:w-[42%] lg:sticky lg:top-24 space-y-10 lg:min-h-[55vh] flex flex-col justify-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-500 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6 shadow-xl shadow-brand-500/5 animate-in fade-in slide-in-from-top-4">
                🏪 {t('home.socialLocal', lang)}
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-black text-white mb-6 tracking-tighter leading-[0.95] animate-in fade-in slide-in-from-left-4 duration-700">
                {L.pageTitle}
              </h1>
              <p className="text-base sm:text-xl text-zinc-500 font-medium leading-relaxed mb-0 animate-in fade-in slide-in-from-left-6 duration-1000">
                {L.pageSubtitle}
              </p>
            </div>

            {/* Visual Social Proof / Preview */}
            <div className="relative group lg:max-w-md">
               <div className="absolute -inset-4 bg-brand-500/10 rounded-[64px] blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-1000" />
               <div className="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-[48px] p-8 overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Restaurant Preview</h3>
                     <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-emerald-500/20">Live</span>
                  </div>
                  
                  {/* Mock Restaurant Card */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-[24px] overflow-hidden shadow-3xl max-w-[280px] mx-auto transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                     <div className="h-32 bg-zinc-800 relative">
                        <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover opacity-80" alt="Preview" />
                        <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-2 py-1 rounded-xl border border-zinc-700 text-[9px] font-black text-white uppercase">4.8 ★</div>
                     </div>
                     <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                           <h4 className="text-sm font-black text-white">Your Restaurant</h4>
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-zinc-600 text-[10px] font-medium mb-3">Italian · Luxembourg</p>
                        <div className="flex gap-1.5">
                           <div className="flex-1 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-[9px] font-black uppercase text-white tracking-widest">Call</div>
                           <div className="flex-1 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[9px] font-black uppercase text-zinc-500 tracking-widest">Menu</div>
                        </div>
                     </div>
                  </div>

                  <p className="mt-8 text-center text-zinc-500 text-[11px] font-medium italic leading-relaxed">
                    "BonApp brought us 15 new tables in the first week. No commissions."
                  </p>
               </div>
            </div>

            {/* Benefit Grid (Hidden on very small mobile if too cluttered, but let's keep it clean) */}
            <div className="grid grid-cols-1 gap-3 lg:max-w-md">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex items-start gap-4 p-4 rounded-[20px] hover:bg-zinc-900/40 transition-colors group border border-transparent hover:border-zinc-800/50">
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-base group-hover:bg-brand-500/10 group-hover:text-brand-500 transition-all shrink-0">
                      {i === 1 ? '💸' : i === 2 ? '🤝' : '📍'}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white mb-0.5 tracking-tight">{L[`benefit${i}Title`]}</h3>
                      <p className="text-zinc-600 text-[11px] font-medium leading-tight">{L[`benefit${i}Body`]}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* ── RIGHT SIDE: FORM ── */}
          <div className="w-full lg:w-[58%]">
            <div className="bg-zinc-900/20 border border-zinc-900 lg:border-zinc-800 rounded-[40px] lg:rounded-[48px] p-6 sm:p-12 lg:p-16 shadow-3xl backdrop-blur-sm relative">
              
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-brand-500/10 rounded-full blur-3xl" />

              {/* Steps Indicator */}
              <div className="flex items-center justify-between mb-12 px-2">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex flex-col items-center gap-2">
                     <span className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl border flex items-center justify-center font-black text-sm transition-all ${
                        (i === 1) ? 'border-brand-500 bg-brand-500/10 text-brand-500 shadow-xl shadow-brand-500/20' : 'border-zinc-800 text-zinc-800'
                     }`}>{i}</span>
                     <span className={`font-black uppercase tracking-widest text-[8px] ${i === 1 ? 'text-brand-500' : 'text-zinc-800'}`}>{L[`step${i}`]}</span>
                   </div>
                 ))}
              </div>

              {/* Tabs */}
              <div className="flex bg-zinc-950/50 border border-zinc-900 rounded-2xl p-1 mb-12 shadow-inner">
                {(['join', 'update'] as AppType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setAppType(type)}
                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all rounded-xl ${
                      appType === type
                        ? 'bg-brand-500 text-white shadow-xl shadow-brand-500/30'
                        : 'text-zinc-700 hover:text-zinc-400'
                    }`}
                  >
                    {type === 'join' ? L.tabJoin : L.tabUpdate}
                  </button>
                ))}
              </div>

              {appType === 'update' && (
                <div className="bg-brand-500/5 border border-brand-500/20 rounded-3xl px-8 py-6 mb-16 text-xs text-brand-400 font-bold leading-relaxed flex items-center gap-4">
                  <span className="text-2xl">💡</span>
                  {L.updateNotice}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-20">
                
                {/* Section 1: Identity */}
                <div className="animate-in fade-in duration-1000">
                  <SectionTitle num="01">{L.sectionRestaurant}</SectionTitle>
                  <div className="space-y-10">
                    <Field label={L.restaurantName} required>
                      <input
                        type="text"
                        required
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Brasserie de la Ville"
                      />
                    </Field>

                    <Field label={L.cuisineType}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        {CUISINE_OPTIONS.map((c) => (
                          <label key={c} className={`flex items-center gap-3 text-[9px] font-black uppercase tracking-widest cursor-pointer border rounded-2xl px-4 py-4 transition-all ${
                            cuisineType.includes(c) ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-zinc-800 bg-zinc-950/40 text-zinc-700 hover:border-zinc-600'
                          }`}>
                            <input
                              type="checkbox"
                              className={checkboxCls}
                              checked={cuisineType.includes(c)}
                              onChange={(e) => {
                                if (e.target.checked) setCuisineType([...cuisineType, c])
                                else setCuisineType(cuisineType.filter((x) => x !== c))
                              }}
                            />
                            {c}
                          </label>
                        ))}
                      </div>
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <Field label={L.city}><input type="text" value={city} onChange={e => setCity(e.target.value)} className={inputCls} placeholder="Luxembourg City" /></Field>
                      <Field label={L.address}><input type="text" value={address} onChange={e => setAddress(e.target.value)} className={inputCls} placeholder="10 Place d'Armes" /></Field>
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact */}
                <div>
                  <SectionTitle num="02">{L.sectionContact}</SectionTitle>
                  <div className="space-y-10">
                    <Field label={L.contactName} required><input type="text" required value={contactName} onChange={e => setContactName(e.target.value)} className={inputCls} placeholder="Full name" /></Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <Field label={L.contactPhone}><input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className={inputCls} placeholder="+352 …" /></Field>
                      <Field label={L.contactEmail} required><input type="email" required value={contactEmail} onChange={e => setContactEmail(e.target.value)} className={inputCls} placeholder="hello@restaurant.lu" /></Field>
                    </div>
                  </div>
                </div>

                {/* Section 3: Presence */}
                <div>
                  <SectionTitle num="03">{L.sectionOnline}</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <Field label={L.websiteUrl}><input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} className={inputCls} placeholder="https://..." /></Field>
                    <Field label={L.imageUrl}><input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={inputCls} placeholder="https://..." /></Field>
                    <Field label={L.orderingUrl}><input type="url" value={orderingUrl} onChange={e => setOrderingUrl(e.target.value)} className={inputCls} placeholder="https://..." /></Field>
                    <Field label={L.menuUrl}><input type="url" value={menuUrl} onChange={e => setMenuUrl(e.target.value)} className={inputCls} placeholder="https://..." /></Field>
                  </div>
                </div>

                {/* Section 4: Service */}
                <div>
                  <SectionTitle num="04">{L.sectionDelivery}</SectionTitle>
                  <div className="flex gap-10 mb-10 bg-zinc-950/40 p-8 rounded-[32px] border border-zinc-800">
                    <label className="flex items-center gap-4 text-xs font-black text-white cursor-pointer group">
                      <input type="checkbox" className={checkboxCls} checked={offersDelivery} onChange={e => setOffersDelivery(e.target.checked)} />
                      <span className="group-hover:text-brand-400 transition-colors uppercase tracking-[0.2em]">{L.offersDelivery}</span>
                    </label>
                    <label className="flex items-center gap-4 text-xs font-black text-white cursor-pointer group">
                      <input type="checkbox" className={checkboxCls} checked={offersPickup} onChange={e => setOffersPickup(e.target.checked)} />
                      <span className="group-hover:text-brand-400 transition-colors uppercase tracking-[0.2em]">{L.offersPickup}</span>
                    </label>
                  </div>

                  {offersDelivery && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-top-4">
                      <Field label={L.deliveryAreas}><input type="text" value={deliveryAreas} onChange={e => setDeliveryAreas(e.target.value)} className={inputCls} placeholder="Zones (e.g. Hesperange)" /></Field>
                      <div className="grid grid-cols-3 gap-6">
                        <Field label={L.minOrder}><input type="number" value={minOrder} onChange={e => setMinOrder(e.target.value)} className={inputCls} placeholder="20" /></Field>
                        <Field label={L.deliveryFee}><input type="number" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} className={inputCls} placeholder="5" /></Field>
                        <Field label={L.estDelivery}><input type="number" value={estDelivery} onChange={e => setEstDelivery(e.target.value)} className={inputCls} placeholder="45" /></Field>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 5: Hours */}
                <div>
                  <SectionTitle num="05">{L.sectionHours}</SectionTitle>
                  <div className="grid gap-4">
                    {schedule.map((day, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-6 bg-zinc-950/40 border border-zinc-800 rounded-[32px] px-8 py-6 hover:border-zinc-700 transition-all group">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 w-16 group-hover:text-zinc-400">
                          {(lang === 'fr' ? DAYS_FR : DAYS_EN)[i]}
                        </span>
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className={checkboxCls} checked={day.open} onChange={e => updateDay(i, 'open', e.target.checked)} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${day.open ? 'text-emerald-400' : 'text-zinc-800'}`}>
                            {day.open ? L.hoursOpen : L.hoursClosed}
                          </span>
                        </label>
                        {day.open && (
                          <div className="flex items-center gap-6 flex-1">
                            <input type="time" value={day.from} onChange={e => updateDay(i, 'from', e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] text-white focus:border-brand-500" />
                            <span className="text-zinc-700">→</span>
                            <input type="time" value={day.to} onChange={e => updateDay(i, 'to', e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] text-white focus:border-brand-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 6: Notes */}
                <div>
                  <SectionTitle num="06">{L.sectionNotes}</SectionTitle>
                  <Field label={L.notes}><textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)} className={`${inputCls} resize-none`} placeholder="Anything else?" /></Field>
                </div>

                {/* Submit */}
                <div className="pt-20 border-t border-zinc-800 text-center">
                  {fieldError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-full px-8 py-4 mb-10 font-black animate-bounce">⚠️ {fieldError}</div>}
                  <button type="submit" disabled={submitting} className="btn-pick-for-me w-full !max-w-none !h-[100px] !text-3xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all">
                    {submitting ? L.submitting : L.submit}
                  </button>
                  <p className="mt-10 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Verified by our team within 48h</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
