// i18n — bilingual strings (EN / FR)
// Usage: t('home.tagline', lang)

type Lang = 'en' | 'fr'

const strings: Record<string, Record<Lang, string>> = {
  // Nav
  'nav.tagline': {
    en: 'Where to eat in Luxembourg — decided in seconds.',
    fr: 'Où manger au Luxembourg — décidé en secondes.',
  },

  // Home — hero
  'home.tagline': {
    en: 'Where to eat in Luxembourg — decided in seconds.',
    fr: 'Où manger au Luxembourg — décidé en secondes.',
  },
  'home.subtitle': {
    en: 'No endless scrolling. 3 real picks. Direct contact.',
    fr: 'Pas de scroll infini. 3 vraies options. Contact direct.',
  },
  'home.pickForMe': {
    en: 'Pick for me',
    fr: 'Choisir pour moi',
  },
  'home.orChoose': {
    en: 'Or choose your vibe',
    fr: 'Ou choisissez votre envie',
  },
  'home.cityLabel': {
    en: '📍 Anywhere in Luxembourg',
    fr: '📍 Partout au Luxembourg',
  },
  'home.cityLoading': {
    en: 'Loading cities...',
    fr: 'Chargement des villes...',
  },
  'home.disclaimer': {
    en: 'BonApp does not deliver food. You contact the restaurant directly.',
    fr: 'BonApp ne livre pas de nourriture. Vous contactez le restaurant directement.',
  },
  'home.savedPlaces': {
    en: 'Your saved places',
    fr: 'Vos lieux enregistrés',
  },

  // Pick for me bottom sheet
  'pickForMe.title': {
    en: 'Quick picks',
    fr: 'Sélection rapide',
  },
  'pickForMe.howMany': {
    en: 'How many people?',
    fr: 'Combien de personnes ?',
  },
  'pickForMe.budget': {
    en: "What's your budget?",
    fr: 'Quel est votre budget ?',
  },
  'pickForMe.show': {
    en: 'Show my picks →',
    fr: 'Voir mes options →',
  },
  'pickForMe.justMe': {
    en: 'Just me',
    fr: 'Seul(e)',
  },
  'pickForMe.twoThree': {
    en: '2–3',
    fr: '2–3',
  },
  'pickForMe.fourPlus': {
    en: '4+',
    fr: '4+',
  },

  // Scenarios
  'scenario.dinner': { en: 'Dinner',         fr: 'Dîner' },
  'scenario.coffee': { en: 'Coffee & desserts', fr: 'Café & desserts' },
  'scenario.drinks': { en: 'Bar & drinks',   fr: 'Bar & boissons' },
  'scenario.quick':  { en: 'Quick bite',     fr: 'Rapide' },

  // Home — How it works
  'howItWorks.title': {
    en: 'How BonApp works',
    fr: 'Comment ça marche',
  },
  'howItWorks.step1': {
    en: 'Choose your vibe',
    fr: 'Choisissez votre envie',
  },
  'howItWorks.step1.hint': {
    en: 'Dinner, coffee, bar or quick bite',
    fr: 'Dîner, café, bar ou rapide',
  },
  'howItWorks.step2': {
    en: 'Get 3 local picks',
    fr: 'Obtenez 3 options locales',
  },
  'howItWorks.step2.hint': {
    en: 'We find the best places nearby',
    fr: 'Nous trouvons les meilleurs endroits près de vous',
  },
  'howItWorks.step3': {
    en: 'Visit or call directly',
    fr: 'Visitez ou appelez directement',
  },
  'howItWorks.step3.hint': {
    en: 'No commissions. No delivery. Ever.',
    fr: 'Sans commissions. Sans livraison. Jamais.',
  },

  // Home — For restaurants block
  'forRestaurants.title': {
    en: 'For restaurants',
    fr: 'Pour les restaurants',
  },
  'forRestaurants.body': {
    en: 'Get more direct customers without high platform commissions.',
    fr: 'Obtenez plus de clients directs sans commissions élevées.',
  },
  'forRestaurants.cta': {
    en: 'Join free pilot →',
    fr: 'Rejoindre le pilote gratuit →',
  },

  // Results
  'results.title': {
    en: 'Your 3 picks',
    fr: 'Vos 3 options',
  },
  'results.subtitle': {
    en: 'The best local options based on your selection.',
    fr: 'Les meilleures options locales selon votre sélection.',
  },
  'results.changePicks': {
    en: '↻ Show different picks',
    fr: '↻ Afficher d\'autres options',
  },
  'results.noAds': {
    en: 'These picks are not ads. We show you the best local options based on data, not commissions.',
    fr: 'Ces suggestions ne sont pas des publicités. Nous vous montrons les meilleures options locales basées sur les données, pas sur les commissions.',
  },
  'results.empty': {
    en: 'No places found nearby',
    fr: 'Aucun endroit trouvé',
  },
  'results.emptyHint': {
    en: 'Try a different option or city',
    fr: 'Essayez une autre option ou ville',
  },
  'results.showAll': {
    en: 'Show all restaurants →',
    fr: 'Voir tous les restaurants →',
  },
  'results.back': { en: '← Back', fr: '← Retour' },

  // Restaurant card
  'card.verified':   { en: 'Verified', fr: 'Vérifié' },
  'card.bestNearby': { en: 'Best nearby option', fr: 'Meilleure option proche' },
  'card.call':       { en: 'Call', fr: 'Appeler' },
  'card.route':      { en: 'Route', fr: 'Itinéraire' },
  'card.menu':       { en: 'Menu', fr: 'Menu' },
  'card.saved':      { en: 'Saved', fr: 'Enregistré' },

  // Restaurant detail
  'restaurant.call':     { en: '📞 Call', fr: '📞 Appeler' },
  'restaurant.route':    { en: '🗺 Route', fr: '🗺 Itinéraire' },
  'restaurant.menu':     { en: '🔗 Menu', fr: '🔗 Menu' },
  'restaurant.notAvailable': { en: 'Contact for details', fr: 'Contacter pour les détails' },
  'restaurant.legalNote': {
    en: 'BonApp does not deliver food.\nYou contact the restaurant directly.',
    fr: 'BonApp ne livre pas de nourriture.\nVous contactez le restaurant directement.',
  },
  'restaurant.address':  { en: 'Address', fr: 'Adresse' },
  'restaurant.hours':    { en: 'Hours', fr: 'Horaires' },
  'restaurant.notes':    { en: 'About', fr: 'À propos' },
  'restaurant.viewDetail': { en: 'See details →', fr: 'Voir les détails →' },

  // Price range labels
  'price.1': { en: '€ Budget',  fr: '€ Budget' },
  'price.2': { en: '€€ Mid',    fr: '€€ Moyen' },
  'price.3': { en: '€€€ Premium', fr: '€€€ Premium' },

  // Footer
  'footer.terms':    { en: 'Terms of Service', fr: "Conditions d'utilisation" },
  'footer.privacy':  { en: 'Privacy Policy', fr: 'Politique de confidentialité' },
  'footer.notice':   { en: 'Legal Notice', fr: 'Mentions légales' },
  'footer.partner':  { en: 'Partner Terms', fr: 'Conditions partenaires' },
  'footer.copy':     { en: '© 2025 BonApp Luxembourg', fr: '© 2025 BonApp Luxembourg' },
  'footer.disclaimer': {
    en: 'BonApp does not deliver food. You contact the restaurant directly.',
    fr: 'BonApp ne livre pas de nourriture. Vous contactez le restaurant directement.',
  },

  // Errors
  'error.loading':  { en: 'Failed to load. Please try again.', fr: 'Échec du chargement. Veuillez réessayer.' },
  'error.notFound': { en: 'Restaurant not found.', fr: 'Restaurant introuvable.' },
}

export function t(key: string, lang: Lang = 'en'): string {
  return strings[key]?.[lang] ?? key
}

export type { Lang }
