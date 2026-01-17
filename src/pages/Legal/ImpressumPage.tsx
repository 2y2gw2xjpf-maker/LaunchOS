/**
 * Impressum Page - Legal requirement for German market
 * Angaben gemäß § 5 TMG
 */

import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b border-purple-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zu LaunchOS
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Impressum</h1>

          <div className="prose prose-purple max-w-none space-y-8">
            {/* Angaben gemäß § 5 TMG */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Angaben gemäß § 5 TMG
              </h2>
              <p className="text-gray-700">
                <strong>[Firmenname / Vor- und Nachname]</strong>
                <br />
                [Straße und Hausnummer]
                <br />
                [PLZ] [Ort]
                <br />
                Deutschland
              </p>
            </section>

            {/* Kontakt */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Kontakt</h2>
              <p className="text-gray-700">
                Telefon: [Telefonnummer]
                <br />
                E-Mail:{' '}
                <a
                  href="mailto:kontakt@launchos.de"
                  className="text-purple-600 hover:text-purple-700"
                >
                  kontakt@launchos.de
                </a>
              </p>
            </section>

            {/* Vertreten durch */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Vertreten durch</h2>
              <p className="text-gray-700">[Geschäftsführer / Inhaber: Vor- und Nachname]</p>
            </section>

            {/* Registereintrag */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Registereintrag</h2>
              <p className="text-gray-700">
                Eintragung im Handelsregister.
                <br />
                Registergericht: [Amtsgericht Ort]
                <br />
                Registernummer: [HRB XXXXX]
              </p>
              <p className="text-gray-500 text-sm mt-2 italic">
                (Entfernen falls nicht zutreffend - z.B. bei Einzelunternehmen)
              </p>
            </section>

            {/* Umsatzsteuer-ID */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Umsatzsteuer-ID</h2>
              <p className="text-gray-700">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
                <br />
                DE [XXXXXXXXX]
              </p>
              <p className="text-gray-500 text-sm mt-2 italic">
                (Entfernen falls keine USt-IdNr. vorhanden)
              </p>
            </section>

            {/* Verantwortlich für den Inhalt */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
              </h2>
              <p className="text-gray-700">
                [Vor- und Nachname]
                <br />
                [Straße und Hausnummer]
                <br />
                [PLZ] [Ort]
              </p>
            </section>

            {/* EU-Streitschlichtung */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">EU-Streitschlichtung</h2>
              <p className="text-gray-700">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
                bereit:{' '}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="text-gray-700 mt-2">
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </section>

            {/* Verbraucherstreitbeilegung */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Verbraucherstreitbeilegung/Universalschlichtungsstelle
              </h2>
              <p className="text-gray-700">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            {/* Haftung für Inhalte */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Haftung für Inhalte</h2>
              <p className="text-gray-700">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen
                Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir
                als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
                rechtswidrige Tätigkeit hinweisen.
              </p>
              <p className="text-gray-700 mt-2">
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
                allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist
                jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
                Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte
                umgehend entfernen.
              </p>
            </section>

            {/* Haftung für Links */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Haftung für Links</h2>
              <p className="text-gray-700">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
                keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
                Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
                Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum
                Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige
                Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
              </p>
              <p className="text-gray-700 mt-2">
                Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
                Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
                Rechtsverletzungen werden wir derartige Links umgehend entfernen.
              </p>
            </section>

            {/* Urheberrecht */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Urheberrecht</h2>
              <p className="text-gray-700">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
                unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
                Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
                bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen
                Gebrauch gestattet.
              </p>
              <p className="text-gray-700 mt-2">
                Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die
                Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
                gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam
                werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von
                Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
              </p>
            </section>
          </div>

          {/* Last Updated */}
          <p className="text-gray-500 text-sm mt-12">Stand: Januar 2026</p>
        </motion.div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-purple-100 bg-white/80 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 LaunchOS</p>
          <div className="flex gap-6">
            <Link to="/datenschutz" className="text-gray-500 hover:text-purple-600 text-sm">
              Datenschutz
            </Link>
            <Link to="/impressum" className="text-purple-600 text-sm font-medium">
              Impressum
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ImpressumPage;
