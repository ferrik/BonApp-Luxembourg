import { useLang } from '../../context/LangContext'

const content = {
  en: {
    title: 'Partner Terms',
    updated: 'Last updated: April 2025',
    sections: [
      {
        heading: '1. What BonApp offers partners',
        body: 'BonApp lists your restaurant on our discovery platform, making it visible to users searching by cuisine category in Luxembourg. We drive traffic to your existing ordering channels (website, phone, delivery link).',
      },
      {
        heading: '2. Free trial period',
        body: 'During the MVP phase, listing on BonApp is free. We track click events (page views, order clicks, call clicks, website clicks) and share basic analytics with partners on request.',
      },
      {
        heading: '3. No exclusivity',
        body: 'Listing on BonApp does not require exclusivity. You may continue to use Wolt, Uber Eats, Just Eat, or any other platform simultaneously.',
      },
      {
        heading: '4. Future pricing',
        body: 'BonApp may introduce paid plans in the future (e.g., subscription or per-click model). Partners will be informed in advance and will have the option to opt out before any charges apply.',
      },
      {
        heading: '5. No payment processing',
        body: 'BonApp does not process payments on behalf of restaurants. All transactions occur directly between customers and the restaurant.',
      },
      {
        heading: '6. Data accuracy',
        body: 'Partners are responsible for notifying BonApp of changes to their restaurant information (menu, hours, delivery zone, phone). Contact us to update your listing.',
      },
      {
        heading: '7. Contact',
        body: 'To register as a partner or update your listing: contact@bonapp.lu (placeholder — update before production launch).',
      },
    ],
  },
  fr: {
    title: 'Conditions partenaires',
    updated: 'Dernière mise à jour : avril 2025',
    sections: [
      {
        heading: '1. Ce que BonApp offre aux partenaires',
        body: "BonApp liste votre restaurant sur notre plateforme de découverte, le rendant visible aux utilisateurs qui recherchent par catégorie de cuisine au Luxembourg. Nous dirigeons le trafic vers vos canaux de commande existants.",
      },
      {
        heading: '2. Période d\'essai gratuite',
        body: "Pendant la phase MVP, le référencement sur BonApp est gratuit. Nous suivons les événements de clics et partageons des analyses de base avec les partenaires sur demande.",
      },
      {
        heading: '3. Pas d\'exclusivité',
        body: "Le référencement sur BonApp n'exige pas d'exclusivité. Vous pouvez continuer à utiliser Wolt, Uber Eats, Just Eat ou toute autre plateforme simultanément.",
      },
      {
        heading: '4. Tarification future',
        body: "BonApp peut introduire des plans payants à l'avenir. Les partenaires seront informés à l'avance et auront la possibilité de se retirer avant l'application de tout frais.",
      },
      {
        heading: '5. Pas de traitement des paiements',
        body: "BonApp ne traite pas les paiements au nom des restaurants. Toutes les transactions ont lieu directement entre les clients et le restaurant.",
      },
      {
        heading: '6. Exactitude des données',
        body: "Les partenaires sont responsables d'informer BonApp des changements apportés aux informations de leur restaurant. Contactez-nous pour mettre à jour votre fiche.",
      },
      {
        heading: '7. Contact',
        body: 'Pour vous inscrire en tant que partenaire : contact@bonapp.lu (placeholder — à mettre à jour avant le lancement en production).',
      },
    ],
  },
}

export default function PartnerTermsPage() {
  const { lang } = useLang()
  const c = content[lang]

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
      <h1 className="text-2xl font-extrabold text-white mb-1">{c.title}</h1>
      <p className="text-xs text-zinc-500 mb-8">{c.updated}</p>
      <div className="space-y-6">
        {c.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-base font-bold text-white mb-2">{s.heading}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  )
}
