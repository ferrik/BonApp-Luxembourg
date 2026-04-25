import { useLang } from '../../context/LangContext'

const content = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: April 2025',
    sections: [
      {
        heading: '1. What we collect',
        body: 'BonApp collects minimal anonymous data: the category selected, the restaurant page visited, and the type of CTA button clicked (order, call, website). We do not collect names, emails, or payment information.',
      },
      {
        heading: '2. Purpose of data collection',
        body: 'Click data is used solely to measure which restaurants receive traffic and to validate that BonApp generates value for restaurant partners. No personal profiles are created.',
      },
      {
        heading: '3. Cookies',
        body: 'BonApp does not use advertising cookies or third-party tracking cookies. We may use a session cookie for language preference only.',
      },
      {
        heading: '4. Third-party services',
        body: 'When you click a restaurant link, you are directed to the restaurant\'s own website or ordering platform, which has its own privacy policy.',
      },
      {
        heading: '5. Data retention',
        body: 'Anonymous click events may be retained for up to 12 months for analytics purposes. No personal data is stored.',
      },
      {
        heading: '6. Contact',
        body: 'For privacy questions, contact us via the contact information on our Legal Notice page.',
      },
    ],
  },
  fr: {
    title: 'Politique de confidentialité',
    updated: 'Dernière mise à jour : avril 2025',
    sections: [
      {
        heading: '1. Ce que nous collectons',
        body: "BonApp collecte des données anonymes minimales : la catégorie sélectionnée, la page du restaurant visitée et le type de bouton CTA cliqué. Nous ne collectons pas de noms, d'e-mails ou d'informations de paiement.",
      },
      {
        heading: '2. Finalité de la collecte',
        body: "Les données de clics sont utilisées uniquement pour mesurer quels restaurants reçoivent du trafic et valider que BonApp génère de la valeur pour les restaurants partenaires. Aucun profil personnel n'est créé.",
      },
      {
        heading: '3. Cookies',
        body: "BonApp n'utilise pas de cookies publicitaires ou de suivi tiers. Nous pouvons utiliser un cookie de session pour la préférence de langue uniquement.",
      },
      {
        heading: '4. Services tiers',
        body: "Lorsque vous cliquez sur un lien de restaurant, vous êtes dirigé vers le propre site web ou la plateforme de commande du restaurant, qui a sa propre politique de confidentialité.",
      },
      {
        heading: '5. Conservation des données',
        body: "Les événements de clics anonymes peuvent être conservés jusqu'à 12 mois à des fins analytiques. Aucune donnée personnelle n'est stockée.",
      },
      {
        heading: '6. Contact',
        body: "Pour toute question relative à la confidentialité, contactez-nous via les coordonnées de notre page Mentions légales.",
      },
    ],
  },
}

export default function PrivacyPage() {
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
