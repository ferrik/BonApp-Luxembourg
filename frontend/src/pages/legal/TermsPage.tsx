import { useLang } from '../../context/LangContext'

const content = {
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: April 2025',
    sections: [
      {
        heading: '1. About BonApp',
        body: 'BonApp Luxembourg is a restaurant discovery and directory platform. We help users find restaurants in Luxembourg that offer their own delivery, pickup, or direct ordering options.',
      },
      {
        heading: '2. No order processing',
        body: 'BonApp does not process, handle, or accept any food orders. All orders and payments are made directly between the user and the restaurant. BonApp has no responsibility for order fulfilment, food quality, delivery times, or payment disputes.',
      },
      {
        heading: '3. Information accuracy',
        body: 'We make reasonable efforts to keep restaurant information accurate, but we do not guarantee completeness or currency of data. Restaurant details (phone, URLs, hours) may change without notice.',
      },
      {
        heading: '4. External links',
        body: 'BonApp may link to external restaurant websites and ordering platforms. We are not responsible for the content, privacy practices, or availability of these external sites.',
      },
      {
        heading: '5. Changes',
        body: 'We reserve the right to update these terms at any time. Continued use of BonApp after changes constitutes acceptance of the new terms.',
      },
    ],
  },
  fr: {
    title: "Conditions d'utilisation",
    updated: 'Dernière mise à jour : avril 2025',
    sections: [
      {
        heading: '1. À propos de BonApp',
        body: "BonApp Luxembourg est une plateforme de découverte et d'annuaire de restaurants. Nous aidons les utilisateurs à trouver des restaurants au Luxembourg qui proposent leur propre livraison, retrait ou commande directe.",
      },
      {
        heading: '2. Pas de traitement de commandes',
        body: "BonApp ne traite ni n'accepte aucune commande alimentaire. Toutes les commandes et paiements sont effectués directement entre l'utilisateur et le restaurant. BonApp n'est pas responsable de l'exécution des commandes, de la qualité des aliments, des délais de livraison ou des litiges de paiement.",
      },
      {
        heading: "3. Exactitude des informations",
        body: "Nous faisons des efforts raisonnables pour maintenir l'exactitude des informations sur les restaurants, mais nous ne garantissons pas l'exhaustivité ou l'actualité des données.",
      },
      {
        heading: '4. Liens externes',
        body: "BonApp peut renvoyer vers des sites web externes de restaurants et des plateformes de commande. Nous ne sommes pas responsables du contenu, des pratiques de confidentialité ou de la disponibilité de ces sites externes.",
      },
      {
        heading: '5. Modifications',
        body: "Nous nous réservons le droit de mettre à jour ces conditions à tout moment. L'utilisation continue de BonApp après les modifications constitue une acceptation des nouvelles conditions.",
      },
    ],
  },
}

export default function TermsPage() {
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
