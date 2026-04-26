import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { submitPartnerApplication } from '../lib/api'
import type { PartnerApplicationPayload } from '../types'

// Cuisine options matching our categories
const CUISINE_OPTIONS = ['Italian', 'Asian', 'Burger', 'Kebab', 'Indian', 'Local', 'Healthy', 'Other']

type AppType = 'join' | 'update'

const LABELS = {
  en: {
    pageTitle: 'Join BonApp Luxembourg',
    pageSubtitle: 'Free pilot. No commissions. Direct customer orders.',
    tabJoin: 'Add my restaurant',
    tabUpdate: 'Update existing listing',
    updateNotice: "Is your restaurant already listed on BonApp? Request a correction and we'll verify it with you.",
    sectionRestaurant: 'Restaurant info',
    sectionContact: 'Your contact details',
    sectionOnline: 'Online presence',
    sectionDelivery: 'Delivery & pickup',
    sectionNotes: 'Additional notes',
    restaurantName: 'Restaurant name *',
    cuisineType: 'Cuisine type',
    city: 'City / area',
    address: 'Address',
    contactName: 'Contact person *',
    contactPhone: 'Phone',
    contactEmail: 'Email *',
    websiteUrl: 'Website',
    orderingUrl: 'Online ordering link',
    menuUrl: 'Menu link (website / PDF / Google Drive)',
    offersDelivery: 'We offer delivery',
    offersPickup: 'We offer pickup',
    deliveryAreas: 'Delivery areas',
    minOrder: 'Minimum order (€)',
    deliveryFee: 'Delivery fee (€)',
    estDelivery: 'Est. delivery time (minutes)',
    notes: "Anything else you'd like us to know",
    submit: 'Submit restaurant',
    submitting: 'Sending…',
    successTitle: 'Thank you! 🎉',
    successMsg: "We'll review your restaurant and contact you before publishing. This usually takes 1-2 business days.",
    successBack: 'Back to home',
    required: 'Please fill in all required fields.',
    errorGeneric: 'Something went wrong. Please try again or email us at hello@bonapp.lu',
  },
  fr: {
    pageTitle: 'Rejoignez BonApp Luxembourg',
    pageSubtitle: 'Pilote gratuit. Sans commissions. Commandes directes.',
    tabJoin: 'Ajouter mon restaurant',
    tabUpdate: 'Mettre à jour une fiche existante',
    updateNotice: 'Votre restaurant est déjà répertorié sur BonApp ? Demandez une correction et nous la vérifierons avec vous.',
    sectionRestaurant: 'Informations restaurant',
    sectionContact: 'Vos coordonnées',
    sectionOnline: 'Présence en ligne',
    sectionDelivery: 'Livraison & retrait',
    sectionNotes: 'Notes supplémentaires',
    restaurantName: 'Nom du restaurant *',
    cuisineType: 'Type de cuisine',
    city: 'Ville / zone',
    address: 'Adresse',
    contactName: 'Personne de contact *',
    contactPhone: 'Téléphone',
    contactEmail: 'Email *',
    websiteUrl: 'Site web',
    orderingUrl: 'Lien de commande en ligne',
    menuUrl: 'Lien du menu (site / PDF / Google Drive)',
    offersDelivery: 'Nous proposons la livraison',
    offersPickup: 'Nous proposons le retrait',
    deliveryAreas: 'Zones de livraison',
    minOrder: 'Commande minimum (€)',
    deliveryFee: 'Frais de livraison (€)',
    estDelivery: 'Délai de livraison estimé (minutes)',
    notes: 'Autre information à partager',
    submit: 'Soumettre le restaurant',
    submitting: 'Envoi…',
    successTitle: 'Merci ! 🎉',
    successMsg: 'Nous examinerons votre restaurant et vous contacterons avant la publication. Cela prend généralement 1 à 2 jours ouvrables.',
    successBack: 'Retour à l\'accueil',
    required: 'Veuillez remplir tous les champs obligatoires.',
    errorGeneric: 'Une erreur s\'est produite. Réessayez ou écrivez-nous à hello@bonapp.lu',
  },
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 mt-6 first:mt-0">
      {children}
    </h2>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-zinc-400">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition-colors'
const checkboxCls = 'w-4 h-4 accent-brand-500'

export default function PartnersPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const L = LABELS[lang]

  const [appType, setAppType] = useState<AppType>('join')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  // Form state
  const [restaurantName, setRestaurantName] = useState('')
  const [cuisineType, setCuisineType]       = useState('')
  const [city, setCity]                     = useState('')
  const [address, setAddress]               = useState('')
  const [contactName, setContactName]       = useState('')
  const [contactPhone, setContactPhone]     = useState('')
  const [contactEmail, setContactEmail]     = useState('')
  const [websiteUrl, setWebsiteUrl]         = useState('')
  const [orderingUrl, setOrderingUrl]       = useState('')
  const [menuUrl, setMenuUrl]               = useState('')
  const [offersDelivery, setOffersDelivery] = useState(false)
  const [offersPickup, setOffersPickup]     = useState(false)
  const [deliveryAreas, setDeliveryAreas]   = useState('')
  const [minOrder, setMinOrder]             = useState('')
  const [deliveryFee, setDeliveryFee]       = useState('')
  const [estDelivery, setEstDelivery]       = useState('')
  const [notes, setNotes]                   = useState('')

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
      cuisine_type:    cuisineType || undefined,
      city:            city || undefined,
      address:         address || undefined,
      contact_name:    contactName.trim(),
      contact_phone:   contactPhone || undefined,
      contact_email:   contactEmail.trim(),
      website_url:     websiteUrl || undefined,
      ordering_url:    orderingUrl || undefined,
      menu_url:        menuUrl || undefined,
      offers_delivery: offersDelivery,
      offers_pickup:   offersPickup,
      delivery_areas:  deliveryAreas || undefined,
      min_order_eur:   minOrder    ? parseFloat(minOrder)    : null,
      delivery_fee_eur: deliveryFee ? parseFloat(deliveryFee) : null,
      est_delivery_min: estDelivery ? parseInt(estDelivery, 10) : null,
      notes:           notes || undefined,
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

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-6">🎉</div>
          <h1 className="text-2xl font-extrabold text-white mb-3">{L.successTitle}</h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">{L.successMsg}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary px-8 py-3"
          >
            {L.successBack}
          </button>
        </div>
      </main>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <main className="flex-1 max-w-xl mx-auto w-full px-4 py-10">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          🏪 Free pilot · No commissions
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">{L.pageTitle}</h1>
        <p className="text-zinc-400 text-sm">{L.pageSubtitle}</p>
      </div>

      {/* Tabs: join / update */}
      <div className="flex rounded-xl border border-zinc-800 overflow-hidden mb-6">
        {(['join', 'update'] as AppType[]).map((type) => (
          <button
            key={type}
            id={`tab-${type}`}
            onClick={() => setAppType(type)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              appType === type
                ? 'bg-brand-500 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            {type === 'join' ? L.tabJoin : L.tabUpdate}
          </button>
        ))}
      </div>

      {appType === 'update' && (
        <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 mb-6 text-xs text-zinc-400 leading-relaxed">
          {L.updateNotice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Restaurant info */}
        <SectionTitle>{L.sectionRestaurant}</SectionTitle>

        <Field label={L.restaurantName}>
          <input
            id="field-restaurant-name"
            type="text"
            required
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className={inputCls}
            placeholder="e.g. Pizza Roma Express"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={L.cuisineType}>
            <select
              id="field-cuisine-type"
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              className={inputCls}
            >
              <option value="">—</option>
              {CUISINE_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label={L.city}>
            <input
              id="field-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputCls}
              placeholder="e.g. Differdange"
            />
          </Field>
        </div>

        <Field label={L.address}>
          <input
            id="field-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputCls}
            placeholder="e.g. 5 Av. de la Liberté"
          />
        </Field>

        {/* Contact */}
        <SectionTitle>{L.sectionContact}</SectionTitle>

        <Field label={L.contactName}>
          <input
            id="field-contact-name"
            type="text"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className={inputCls}
            placeholder="Your name"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={L.contactPhone}>
            <input
              id="field-contact-phone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className={inputCls}
              placeholder="+352 …"
            />
          </Field>

          <Field label={L.contactEmail}>
            <input
              id="field-contact-email"
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputCls}
              placeholder="you@restaurant.lu"
            />
          </Field>
        </div>

        {/* Online presence */}
        <SectionTitle>{L.sectionOnline}</SectionTitle>

        <Field label={L.websiteUrl}>
          <input
            id="field-website-url"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className={inputCls}
            placeholder="https://"
          />
        </Field>

        <Field label={L.orderingUrl}>
          <input
            id="field-ordering-url"
            type="url"
            value={orderingUrl}
            onChange={(e) => setOrderingUrl(e.target.value)}
            className={inputCls}
            placeholder="https://"
          />
        </Field>

        <Field label={L.menuUrl}>
          <input
            id="field-menu-url"
            type="url"
            value={menuUrl}
            onChange={(e) => setMenuUrl(e.target.value)}
            className={inputCls}
            placeholder="https://drive.google.com/…"
          />
        </Field>

        {/* Delivery & pickup */}
        <SectionTitle>{L.sectionDelivery}</SectionTitle>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input
              id="field-offers-delivery"
              type="checkbox"
              className={checkboxCls}
              checked={offersDelivery}
              onChange={(e) => setOffersDelivery(e.target.checked)}
            />
            {L.offersDelivery}
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input
              id="field-offers-pickup"
              type="checkbox"
              className={checkboxCls}
              checked={offersPickup}
              onChange={(e) => setOffersPickup(e.target.checked)}
            />
            {L.offersPickup}
          </label>
        </div>

        {offersDelivery && (
          <>
            <Field label={L.deliveryAreas}>
              <input
                id="field-delivery-areas"
                type="text"
                value={deliveryAreas}
                onChange={(e) => setDeliveryAreas(e.target.value)}
                className={inputCls}
                placeholder="e.g. Differdange, Pétange, Sanem"
              />
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field label={L.minOrder}>
                <input
                  id="field-min-order"
                  type="number"
                  min="0"
                  step="0.5"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className={inputCls}
                  placeholder="12"
                />
              </Field>
              <Field label={L.deliveryFee}>
                <input
                  id="field-delivery-fee"
                  type="number"
                  min="0"
                  step="0.5"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className={inputCls}
                  placeholder="3"
                />
              </Field>
              <Field label={L.estDelivery}>
                <input
                  id="field-est-delivery"
                  type="number"
                  min="0"
                  step="5"
                  value={estDelivery}
                  onChange={(e) => setEstDelivery(e.target.value)}
                  className={inputCls}
                  placeholder="35"
                />
              </Field>
            </div>
          </>
        )}

        {/* Notes */}
        <SectionTitle>{L.sectionNotes}</SectionTitle>

        <Field label={L.notes}>
          <textarea
            id="field-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputCls} resize-none`}
            placeholder="Menu text, special hours, special conditions…"
          />
        </Field>

        {/* Error */}
        {fieldError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl px-4 py-3">
            {fieldError}
          </div>
        )}

        {/* Submit */}
        <button
          id="btn-submit-partner"
          type="submit"
          disabled={submitting}
          className="w-full btn-primary py-4 text-base font-bold mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? L.submitting : L.submit}
        </button>

        <p className="text-xs text-zinc-600 text-center">
          BonApp reviews every listing before publishing. No auto-publish.
        </p>
      </form>
    </main>
  )
}
