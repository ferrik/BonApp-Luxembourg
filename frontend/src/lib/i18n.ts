// i18n - bilingual strings (EN / FR)
// Usage: t('home.tagline', lang)

type Lang = 'en' | 'fr' | 'lb'

const strings: Record<string, Record<Lang, string>> = {
  'nav.home': { en: 'Home', fr: 'Heem', lb: 'Heem' },
  'nav.tonight': { en: 'Tonight', fr: 'Ce soir', lb: 'Haut den Owend' },
  'nav.forRestaurants': { en: 'For restaurants', fr: 'Pour les restaurants', lb: 'Fir Restauranten' },
  'nav.tagline': {
    en: 'Find where to eat in Luxembourg in under 10 seconds.',
    fr: 'Trouvez où manger au Luxembourg en 10 secondes.',
    lb: 'Fann wou ze iessen zu Lëtzebuerg an ënner 10 Sekonnen.',
  },

  'home.tagline': {
    en: 'Find where to eat in Luxembourg in under 10 seconds.',
    fr: 'Trouvez où manger au Luxembourg en 10 secondes.',
    lb: 'Fann wou ze iessen zu Lëtzebuerg an ënner 10 Sekonnen.',
  },
  'home.subtitle': {
    en: 'No endless scrolling. Just 3 good places.',
    fr: 'Pas de scroll infini. Juste 3 bonnes options.',
    lb: 'Kee laange Scrollen. Just 3 gutt Plazen.',
  },
  'home.pickForMe': {
    en: '🍽 Pick my place tonight',
    fr: '🍽 Trouve-moi un endroit',
    lb: '🍽 Fannt meng Plaz haut',
  },
  'home.orChoose': {
    en: 'Or choose your vibe',
    fr: 'Ou choisissez votre envie',
    lb: 'Oder wielt Är Vibe',
  },
  'home.cityLabel': {
    en: 'Anywhere in Luxembourg',
    fr: 'Partout au Luxembourg',
    lb: 'Iwwerall zu Lëtzebuerg',
  },
  'home.savedPlaces': {
    en: 'Your saved places',
    fr: 'Vos lieux enregistrés',
    lb: 'Är gespäichert Plazen',
  },
  'home.trending': {
    en: 'Trending tonight',
    fr: 'Tendance ce soir',
    lb: 'Trend haut den Owend',
  },
  'home.tonightTitle': {
    en: 'Tonight in Luxembourg',
    fr: 'Ce soir au Luxembourg',
    lb: 'Haut den Owend zu Lëtzebuerg',
  },
  'home.tonightSubtitle': {
    en: '3 places worth checking now',
    fr: '3 endroits à découvrir maintenant',
    lb: '3 Plazen déi et wäert sinn elo ze gesinn',
  },
  'home.livePicks': {
    en: 'Good options right now',
    fr: 'Bonnes options maintenant',
    lb: 'Gutt Optiounen elo',
  },
  'home.livePicksHint': {
    en: 'Start here, or let BonApp narrow it down.',
    fr: 'Commencez ici, ou laissez BonApp choisir.',
    lb: 'Start hei, oder loosst BonApp d\'Auswiel begrenzen.',
  },
  'home.socialLocal': { en: 'Local restaurants', fr: 'Restaurants locaux', lb: 'Lokal Restauranten' },
  'home.socialNoApps': { en: 'Direct contact', fr: 'Contact direct', lb: 'Direkte Kontakt' },
  'home.socialDirect': { en: 'No delivery apps', fr: 'Pas d apps de livraison', lb: 'Keng Liwwer-Apps' },
  'home.curated': { en: 'Curated picks', fr: 'Sélection triée', lb: 'Ausgewielten Tipps' },

  'pickForMe.title': { en: 'Quick picks', fr: 'Sélection rapide', lb: 'Schnell Auswiel' },
  'pickForMe.howMany': { en: 'How many people?', fr: 'Combien de personnes ?', lb: 'Wéi vill Leit?' },
  'pickForMe.budget': { en: "What's your budget?", fr: 'Quel est votre budget ?', lb: 'Wat ass Äre Budget?' },
  'pickForMe.show': { en: 'Show my picks', fr: 'Voir mes options', lb: 'Weis meng Tipps' },
  'pickForMe.justMe': { en: 'Just me', fr: 'Seul(e)', lb: 'Just ech' },
  'pickForMe.twoThree': { en: '2-3', fr: '2-3', lb: '2-3' },
  'pickForMe.fourPlus': { en: '4+', fr: '4+', lb: '4+' },

  'scenario.dinner': { en: '🍽 Dinner tonight', fr: '🍽 Dîner ce soir', lb: '🍽 Iessen haut den Owend' },
  'scenario.coffee': { en: '☕ Coffee break', fr: '☕ Pause café', lb: '☕ Kaffispaus' },
  'scenario.drinks': { en: '🍷 Drinks tonight', fr: '🍷 Verre entre amis', lb: '🍷 Drinks haut den Owend' },
  'scenario.quick': { en: '⚡ Fast lunch', fr: '⚡ Déjeuner rapide', lb: '⚡ Schnell Mëttegiessen' },

  'howItWorks.title': { en: 'How BonApp works', fr: 'Comment ça marche', lb: 'Wéi BonApp funktionéiert' },
  'howItWorks.step1': { en: 'Choose your vibe', fr: 'Choisissez votre envie', lb: 'Wielt Är Vibe' },
  'howItWorks.step1.hint': {
    en: 'Dinner, coffee, drinks or a quick lunch',
    fr: 'Dîner, café, apéro ou déjeuner rapide',
    lb: 'Iessen, Kaffi, Drinks oder e schnell Mëttegiessen',
  },
  'howItWorks.step2': { en: 'Get 3 local picks', fr: 'Obtenez 3 options locales', lb: 'Kritt 3 lokal Tipps' },
  'howItWorks.step2.hint': {
    en: 'BonApp filters the noise for you',
    fr: 'BonApp filtre le bruit pour vous',
    lb: 'BonApp filtert d\'Kaméidi fir Iech',
  },
  'howItWorks.step3': { en: 'Visit or call directly', fr: 'Visitez ou appelez directement', lb: 'Besicht oder rufft direkt un' },
  'howItWorks.step3.hint': {
    en: 'You contact the restaurant yourself',
    fr: 'Vous contactez le restaurant vous-même',
    lb: 'Dir kontaktéiert de Restaurant selwer',
  },

  'forRestaurants.title': { en: 'For restaurants', fr: 'Pour les restaurants', lb: 'Fir Restauranten' },
  'forRestaurants.body': {
    en: 'Join the free pilot and help local guests find you faster.',
    fr: 'Rejoignez le pilote gratuit et aidez les clients locaux à vous trouver plus vite.',
    lb: 'Maacht beim gratis Pilot mat an hëlleft lokale Gäscht Iech méi séier ze fannen.',
  },
  'forRestaurants.cta': { en: 'Join free pilot', fr: 'Rejoindre le pilote gratuit', lb: 'Beim gratis Pilot matmaachen' },
  'forRestaurants.feat1': { en: 'People find you easily', fr: 'Les clients vous trouvent facilement', lb: 'Leit fannen Iech einfach' },
  'forRestaurants.feat2': { en: 'They call or visit directly', fr: 'Ils appellent ou visitent directement', lb: 'Si ruffen un oder kommen direkt laanscht' },
  'forRestaurants.feat3': { en: 'No platform checkout', fr: 'Pas de paiement plateforme', lb: 'Keng Plattform-Bezuelung' },

  'results.title': { en: 'Your 3 picks', fr: 'Vos 3 options', lb: 'Är 3 Tipps' },
  'results.subtitle': {
    en: 'The best local options based on your selection.',
    fr: 'Les meilleures options locales selon votre sélection.',
    lb: 'Déi bescht lokal Optiounen baséiert op Ärer Auswiel.',
  },
  'results.changePicks': { en: 'Show different picks', fr: 'Afficher d autres options', lb: 'Weis aner Tipps' },
  'results.noAds': {
    en: 'These picks are not ads. They are ranked by usefulness signals, not commissions.',
    fr: 'Ces suggestions ne sont pas des publicités. Elles sont classées par signaux utiles, pas par commissions.',
    lb: 'Dës Tipps si keng Annoncen. Si ginn no nëtzleche Signaler klasséiert, net no Kommissiounen.',
  },
  'results.empty': { en: 'No places found nearby', fr: 'Aucun endroit trouvé', lb: 'Keng Plaze fonnt' },
  'results.emptyHint': { en: 'Try a different option or city', fr: 'Essayez une autre option ou ville', lb: 'Probéiert eng aner Optioun oder Stad' },
  'results.showAll': { en: 'Show all restaurants', fr: 'Voir tous les restaurants', lb: 'Weis all Restauranten' },
  'results.back': { en: 'Back', fr: 'Retour', lb: 'Zréck' },

  'card.openNow': { en: 'Open now', fr: 'Ouvert maintenant', lb: 'Elo op' },
  'card.verified': { en: 'Verified', fr: 'Vérifié', lb: 'Verifizéiert' },
  'card.bestNearby': { en: 'Best nearby option', fr: 'Meilleure option proche', lb: 'Bescht Optioun an der Géigend' },
  'card.call': { en: 'Call', fr: 'Appeler', lb: 'Ruffen' },
  'card.route': { en: 'Route', fr: 'Itinéraire', lb: 'Route' },
  'card.menu': { en: 'Website', fr: 'Site web', lb: 'Websäit' },
  'card.saved': { en: 'Saved', fr: 'Enregistré', lb: 'Gespäichert' },
  'card.cozy': { en: 'Cozy', fr: 'Cosy', lb: 'Gemittlech' },
  'card.fast': { en: 'Fast', fr: 'Rapide', lb: 'Séier' },
  'card.premium': { en: 'Premium', fr: 'Premium', lb: 'Premium' },
  'card.casual': { en: 'Casual', fr: 'Casual', lb: 'Casual' },
  'card.terrace': { en: 'Terrace', fr: 'Terrasse', lb: 'Terrass' },
  'card.parking': { en: 'Parking', fr: 'Parking', lb: 'Parking' },
  'card.groups': { en: 'Good for groups', fr: 'Bien pour les groupes', lb: 'Gutt fir Gruppen' },

  'restaurant.call': { en: 'Call', fr: 'Appeler', lb: 'Ruffen' },
  'restaurant.route': { en: 'Route', fr: 'Itinéraire', lb: 'Route' },
  'restaurant.menu': { en: 'Website', fr: 'Site web', lb: 'Websäit' },
  'restaurant.notAvailable': { en: 'Contact for details', fr: 'Contacter pour les détails', lb: 'Kontakt fir Detailer' },
  'restaurant.legalNote': {
    en: 'BonApp does not deliver food. You contact the restaurant directly.',
    fr: 'BonApp ne livre pas de nourriture. Vous contactez le restaurant directement.',
    lb: 'BonApp liwwert kee Liewensmëttel. Dir kontaktéiert de Restaurant direkt.',
  },
  'restaurant.address': { en: 'Address', fr: 'Adresse', lb: 'Adress' },
  'restaurant.hours': { en: 'Hours', fr: 'Horaires', lb: 'Auerzäiten' },
  'restaurant.notes': { en: 'About', fr: 'À propos', lb: 'Iwwer' },
  'restaurant.viewDetail': { en: 'See details', fr: 'Voir les détails', lb: 'Detailer gesinn' },

  'price.1': { en: 'EUR Budget', fr: 'EUR Budget', lb: 'EUR Budget' },
  'price.2': { en: 'EUR EUR Mid', fr: 'EUR EUR Moyen', lb: 'EUR EUR Mëttel' },
  'price.3': { en: 'EUR EUR EUR Premium', fr: 'EUR EUR EUR Premium', lb: 'EUR EUR EUR Premium' },

  'footer.feat1.title': { en: 'Smart selection', fr: 'Sélection intelligente', lb: 'Smart Auswiel' },
  'footer.feat1.desc': { en: 'Only 3 useful picks', fr: 'Seulement 3 options utiles', lb: 'Just 3 nëtzlech Tipps' },
  'footer.feat2.title': { en: 'Direct contact', fr: 'Contact direct', lb: 'Direkte Kontakt' },
  'footer.feat2.desc': { en: 'Call or visit yourself', fr: 'Appelez ou visitez vous-même', lb: 'Rufft un oder besicht selwer' },
  'footer.feat3.title': { en: 'No delivery app', fr: 'Pas d app livraison', lb: 'Keng Liwwer-App' },
  'footer.feat3.desc': { en: 'BonApp does not deliver', fr: 'BonApp ne livre pas', lb: 'BonApp liwwert net' },
  'footer.feat4.title': { en: 'Local service', fr: 'Service local', lb: 'Lokale Service' },
  'footer.feat4.desc': { en: 'Made for Luxembourg', fr: 'Fait pour le Luxembourg', lb: 'Fir Lëtzebuerg gemaach' },
  'footer.terms': { en: 'Terms of Service', fr: 'Conditions d utilisation', lb: 'Service-Bedéngungen' },
  'footer.privacy': { en: 'Privacy Policy', fr: 'Politique de confidentialité', lb: 'Dateschutzerklärung' },
  'footer.notice': { en: 'Legal Notice', fr: 'Mentions légales', lb: 'Impressum' },
  'footer.partner': { en: 'Partner Terms', fr: 'Conditions partenaires', lb: 'Partner-Bedéngungen' },
  'footer.copy': { en: '2026 BonApp Luxembourg', fr: '2026 BonApp Luxembourg', lb: '2026 BonApp Luxembourg' },
  'footer.disclaimer': {
    en: 'BonApp does not deliver food. You contact the restaurant directly.',
    fr: 'BonApp ne livre pas de nourriture. Vous contactez le restaurant directement.',
    lb: 'BonApp liwwert kee Liewensmëttel. Dir kontaktéiert de Restaurant direkt.',
  },

  'error.loading': { en: 'Failed to load. Please try again.', fr: 'Échec du chargement. Veuillez réessayer.', lb: 'Feeler beim Lueden. Probéiert w.e.g. nach eng Kéier.' },
  'error.notFound': { en: 'Restaurant not found.', fr: 'Restaurant introuvable.', lb: 'Restaurant net fonnt.' },
}

export function t(key: string, lang: Lang = 'en'): string {
  return strings[key]?.[lang] ?? key
}

export type { Lang }

