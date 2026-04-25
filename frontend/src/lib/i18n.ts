// i18n — simple bilingual strings (EN / FR)
// Usage: t('home.title', lang)

type Lang = 'en' | 'fr'

const strings: Record<string, Record<Lang, string>> = {
  // Nav
  'nav.tagline': {
    en: 'Food discovery in Luxembourg',
    fr: 'Découvrez la restauration au Luxembourg',
  },

  // Home
  'home.title': {
    en: 'What are you craving?',
    fr: 'Qu\'est-ce qui vous fait envie ?',
  },
  'home.subtitle': {
    en: 'Choose a category and we\'ll find the best options for you.',
    fr: 'Choisissez une catégorie et nous trouverons les meilleures options.',
  },
  'home.surprise': {
    en: '🎲 Surprise me',
    fr: '🎲 Surprends-moi',
  },
  'home.disclaimer': {
    en: 'BonApp is a discovery platform. Orders happen directly with the restaurant.',
    fr: 'BonApp est une plateforme de découverte. Les commandes se font directement avec le restaurant.',
  },

  // Categories
  'cat.Italian': { en: '🍕 Pizza', fr: '🍕 Pizza' },
  'cat.Asian':   { en: '🍜 Asian', fr: '🍜 Asiatique' },
  'cat.Burger':  { en: '🍔 Burger', fr: '🍔 Burger' },
  'cat.Kebab':   { en: '🥙 Kebab', fr: '🥙 Kebab' },
  'cat.Indian':  { en: '🍛 Indian', fr: '🍛 Indien' },
  'cat.Local':   { en: '🥘 Local', fr: '🥘 Local' },
  'cat.Healthy': { en: '🥗 Healthy', fr: '🥗 Healthy' },
  'cat.Other':   { en: '🍽️ Other', fr: '🍽️ Autre' },

  // Results
  'results.title': {
    en: 'Top picks for you',
    fr: 'Les meilleurs choix pour vous',
  },
  'results.empty': {
    en: 'No restaurants found in this category yet.',
    fr: 'Aucun restaurant trouvé dans cette catégorie pour l\'instant.',
  },
  'results.back': { en: '← Back', fr: '← Retour' },

  // Restaurant card / detail
  'restaurant.delivery':  { en: 'Delivery', fr: 'Livraison' },
  'restaurant.pickup':    { en: 'Pickup', fr: 'À emporter' },
  'restaurant.ordering':  { en: 'Online order', fr: 'Commande en ligne' },
  'restaurant.viewDetail': { en: 'View restaurant', fr: 'Voir le restaurant' },
  'restaurant.order':     { en: '🛵 Order directly', fr: '🛵 Commander directement' },
  'restaurant.call':      { en: '📞 Call', fr: '📞 Appeler' },
  'restaurant.website':   { en: '🌐 Website', fr: '🌐 Site web' },
  'restaurant.minOrder':  { en: 'Min. order', fr: 'Commande min.' },
  'restaurant.deliveryFee': { en: 'Delivery fee', fr: 'Frais de livraison' },
  'restaurant.notAvailable': { en: 'Contact for details', fr: 'Contacter pour les détails' },

  // Footer
  'footer.terms':    { en: 'Terms of Service', fr: 'Conditions d\'utilisation' },
  'footer.privacy':  { en: 'Privacy Policy', fr: 'Politique de confidentialité' },
  'footer.notice':   { en: 'Legal Notice', fr: 'Mentions légales' },
  'footer.partner':  { en: 'Partner Terms', fr: 'Conditions partenaires' },
  'footer.copy':     { en: '© 2025 BonApp Luxembourg', fr: '© 2025 BonApp Luxembourg' },

  // Errors
  'error.loading':  { en: 'Failed to load. Please try again.', fr: 'Échec du chargement. Veuillez réessayer.' },
  'error.notFound': { en: 'Restaurant not found.', fr: 'Restaurant introuvable.' },
}

export function t(key: string, lang: Lang = 'en'): string {
  return strings[key]?.[lang] ?? key
}

export type { Lang }
