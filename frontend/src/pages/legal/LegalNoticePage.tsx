import { useLang } from '../../context/LangContext'

const content = {
  en: {
    title: 'Legal Notice',
    updated: 'Last updated: April 2025',
    sections: [
      {
        heading: 'Publisher',
        body: 'BonApp Luxembourg\nOperating as an individual project / startup.\nLuxembourg',
      },
      {
        heading: 'Nature of service',
        body: 'BonApp is a restaurant discovery and directory platform. It is not a delivery company, payment processor, or marketplace. All commercial transactions occur directly between users and restaurants.',
      },
      {
        heading: 'Liability',
        body: 'BonApp provides restaurant information in good faith but does not guarantee its accuracy, completeness, or currency. BonApp is not liable for any direct or indirect damages arising from the use of the platform or from interactions with listed restaurants.',
      },
      {
        heading: 'Intellectual property',
        body: 'All content on BonApp, including design, text, and code, is the property of BonApp Luxembourg unless stated otherwise. Restaurant names, logos, and associated content remain the property of their respective owners.',
      },
      {
        heading: 'Contact',
        body: 'For any legal inquiries, please contact: contact@bonapp.lu (placeholder — update before production launch).',
      },
    ],
  },
  fr: {
    title: 'Mentions légales',
    updated: 'Dernière mise à jour : avril 2025',
    sections: [
      {
        heading: 'Éditeur',
        body: 'BonApp Luxembourg\nExploité en tant que projet individuel / startup.\nLuxembourg',
      },
      {
        heading: 'Nature du service',
        body: "BonApp est une plateforme de découverte et d'annuaire de restaurants. Ce n'est pas une société de livraison, un processeur de paiement ou une place de marché. Toutes les transactions commerciales ont lieu directement entre les utilisateurs et les restaurants.",
      },
      {
        heading: 'Responsabilité',
        body: "BonApp fournit des informations sur les restaurants de bonne foi mais ne garantit pas leur exactitude, leur exhaustivité ou leur actualité. BonApp n'est pas responsable des dommages directs ou indirects résultant de l'utilisation de la plateforme.",
      },
      {
        heading: 'Propriété intellectuelle',
        body: "Tout le contenu de BonApp, y compris la conception, le texte et le code, est la propriété de BonApp Luxembourg. Les noms de restaurants, logos et contenus associés restent la propriété de leurs propriétaires respectifs.",
      },
      {
        heading: 'Contact',
        body: 'Pour toute demande légale : contact@bonapp.lu (placeholder — à mettre à jour avant le lancement en production).',
      },
    ],
  },
}

export default function LegalNoticePage() {
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
            <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  )
}
