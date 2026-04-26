// i18n — simple bilingual strings (EN / FR)
// Usage: t('home.title', lang)

type Lang = 'en' | 'fr'

const strings: Record<string, Record<Lang, string>> = {
  // Nav
  'nav.tagline': {
    en: '3 food picks. Direct restaurant orders.',
    fr: '3 suggestions. Commande directe au restaurant.',
  },

  // Home — hero
  'home.title': {
    en: 'Hungry in Luxembourg?',
    fr: 'Faim au Luxembourg ?',
  },
  'home.titleAccent': {
    en: 'Get 3 smart food picks in seconds.',
    fr: 'Obtenez 3 suggestions en quelques secondes.',
  },
  'home.subtitle': {
    en: 'No endless scrolling. Choose what you crave and BonApp shows the best direct-order options.',
    fr: 'Pas de scroll infini. Choisissez ce qui vous fait envie et BonApp affiche les meilleures options de commande directe.',
  },
  'home.pickForMe': {
    en: '🎲 Pick for me',
    fr: '🎲 Choisir pour moi',
  },
  'home.orChoose': {
    en: 'or choose your craving',
    fr: 'ou choisissez ce qui vous fait envie',
  },
  // kept for compatibility — not used in UI anymore
  'home.surprise': {
    en: '🎲 Pick for me',
    fr: '🎲 Choisir pour moi',
  },
  'home.disclaimer': {
    en: 'BonApp does not deliver food. Orders happen directly with the restaurant.',
    fr: "BonApp ne livre pas de nourriture. Les commandes se font directement avec le restaurant.",
  },

  // Home — How it works
  'howItWorks.title': {
    en: 'How BonApp works',
    fr: 'Comment ça marche',
  },
  'howItWorks.step1': {
    en: 'Choose what you want',
    fr: 'Choisissez ce que vous voulez',
  },
  'howItWorks.step2': {
    en: 'Get 3 local picks',
    fr: 'Recevez 3 suggestions locales',
  },
  'howItWorks.step3': {
    en: 'Order directly from the restaurant',
    fr: 'Commandez directement auprès du restaurant',
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

  // Categories
  'cat.Italian': { en: 'Pizza', fr: 'Pizza' },
  'cat.Asian':   { en: 'Sushi', fr: 'Sushi' },
  'cat.Burger':  { en: 'Burger', fr: 'Burger' },
  'cat.Kebab':   { en: 'Kebab', fr: 'Kebab' },
  'cat.Indian':  { en: 'Indian', fr: 'Indien' },
  'cat.Local':   { en: 'Local', fr: 'Local' },
  'cat.Healthy': { en: 'Healthy', fr: 'Healthy' },
  'cat.Other':   { en: 'Other', fr: 'Autre' },

  // Results
  'results.title': {
    en: 'Top 3 picks for you',
    fr: 'Les 3 meilleures suggestions',
  },
  'results.subtitle': {
    en: "We've selected the best options based on speed, price and local reviews.",
    fr: "Nous avons sélectionné les meilleures options selon la rapidité, le prix et les avis locaux.",
  },
  'results.changePicks': {
    en: '↻ Change my picks',
    fr: '↻ Changer mes suggestions',
  },
  'results.noAds': {
    en: 'These picks are not ads. We show you the best local options.',
    fr: "Ces suggestions ne sont pas des publicités. Nous vous montrons les meilleures options locales.",
  },
  'results.empty': {
    en: 'No restaurants found in this category yet.',
    fr: "Aucun restaurant trouvé dans cette catégorie pour l'instant.",
  },
  'results.back': { en: '← Back', fr: '← Retour' },

  // Restaurant card / detail
  'restaurant.delivery':    { en: 'Delivery', fr: 'Livraison' },
  'restaurant.pickup':      { en: 'Pickup', fr: 'À emporter' },
  'restaurant.ordering':    { en: 'Online order', fr: 'Commande en ligne' },
  'restaurant.bestFor':     { en: 'Best for:', fr: 'Idéal pour :' },
  'restaurant.viewDetail':  { en: 'See order options', fr: 'Voir les options' },
  // Smart CTA labels
  'restaurant.order':       { en: '🛵 Order directly', fr: '🛵 Commander directement' },
  'restaurant.callToOrder': { en: '📞 Call to order', fr: '📞 Appeler pour commander' },
  'restaurant.call':        { en: '📞 Call', fr: '📞 Appeler' },
  'restaurant.website':     { en: '🌐 Visit website', fr: '🌐 Visiter le site' },
  'restaurant.minOrder':    { en: 'Min. order', fr: 'Commande min.' },
  'restaurant.deliveryFee': { en: 'Delivery fee', fr: 'Frais de livraison' },
  'restaurant.notAvailable': { en: 'Contact for details', fr: 'Contacter pour les détails' },
  'restaurant.legalNote': {
    en: 'BonApp does not deliver food.\nYou order directly from the restaurant.',
    fr: "BonApp ne livre pas de nourriture.\nVous commandez directement auprès du restaurant.",
  },

  // Footer
  'footer.terms':    { en: 'Terms of Service', fr: "Conditions d'utilisation" },
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
