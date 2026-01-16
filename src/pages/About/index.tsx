import * as React from 'react';
import { motion } from 'framer-motion';
import { Header, EnhancedSidebar, PageContainer } from '@/components/layout';
import { Card } from '@/components/ui';
import { Calculator, TrendingUp, Briefcase, Shield, Lock, Eye, Server } from 'lucide-react';

const valuationMethods = [
  {
    name: 'Berkus-Methode',
    icon: Calculator,
    description: 'Bewertet Pre-Revenue Startups anhand von 5 Risikofaktoren. Jeder Faktor kann bis zu 500K € beitragen.',
    bestFor: 'Sehr fruhe Startups ohne Umsatz',
    limitations: 'Maximale Bewertung 2,5M €, keine Berucksichtigung von Umsatz',
  },
  {
    name: 'Scorecard-Methode',
    icon: TrendingUp,
    description: 'Vergleicht dein Startup mit durchschnittlichen Pre-Seed Unternehmen anhand gewichteter Faktoren.',
    bestFor: 'Pre-Seed bis Seed Phase',
    limitations: 'Erfordert Kenntnisse uber Durchschnittsbewertungen in deiner Region',
  },
  {
    name: 'VC-Methode',
    icon: Briefcase,
    description: 'Rechnet vom erwarteten Exit-Wert zuruck unter Berucksichtigung der Rendite-Erwartung von Investoren.',
    bestFor: 'Wenn du einen klaren Exit-Plan hast',
    limitations: 'Stark abhangig von Exit-Annahmen, hohe Unsicherheit',
  },
];

const privacyPoints = [
  {
    icon: Server,
    title: 'Analyse im Browser',
    description: 'Alle Berechnungen finden lokal in deinem Browser statt. Gespeichert werden nur Account- und Abrechnungsdaten.',
  },
  {
    icon: Lock,
    title: 'Kostenlos registrieren',
    description: 'Ein Account reicht, um Projekte und Einstellungen zu speichern. 1 Projekt ist gratis.',
  },
  {
    icon: Eye,
    title: 'Transparente Methodik',
    description: 'Alle Berechnungen sind transparent und nachvollziehbar. Du siehst immer, wie wir zu unseren Empfehlungen kommen.',
  },
  {
    icon: Shield,
    title: 'Deine Kontrolle',
    description: 'Du entscheidest, wie viel du teilst. Selbst mit minimalen Daten liefern wir nutzliche Einblicke.',
  },
];

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <EnhancedSidebar />
      <PageContainer withSidebar maxWidth="wide">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-display-sm text-charcoal mb-2">
            Methodik
          </h1>
          <p className="text-charcoal/60">
            LaunchOS verwendet etablierte Bewertungsmethoden aus der Startup-Finanzierung.
          </p>
        </motion.div>

        {/* Valuation Methods */}
        <div className="space-y-6 mb-12">
          {valuationMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <motion.div
                key={method.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-charcoal text-xl mb-2">
                        {method.name}
                      </h3>
                      <p className="text-charcoal/60 mb-4">{method.description}</p>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-purple-50 rounded-xl">
                          <p className="font-semibold text-purple-600 mb-1">Am besten fur:</p>
                          <p className="text-charcoal/60">{method.bestFor}</p>
                        </div>
                        <div className="p-3 bg-pink-50 rounded-xl">
                          <p className="font-semibold text-pink-600 mb-1">Limitationen:</p>
                          <p className="text-charcoal/60">{method.limitations}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Confidence System */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-display text-xl font-semibold text-charcoal mb-4">
            Unser Confidence-System
          </h2>
          <p className="text-charcoal/60 mb-6">
            Wir sind transparent daruber, wie sicher unsere Analysen sind.
          </p>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-purple-100">
                <span className="font-medium text-charcoal">Tier-Level</span>
                <span className="text-charcoal/60">Je mehr du teilst, desto genauer</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-purple-100">
                <span className="font-medium text-charcoal">Daten-Vollstandigkeit</span>
                <span className="text-charcoal/60">Ausgefullte Felder verbessern die Analyse</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-purple-100">
                <span className="font-medium text-charcoal">Methoden-Ubereinstimmung</span>
                <span className="text-charcoal/60">Ahnliche Ergebnisse = hohere Sicherheit</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="font-medium text-charcoal">Marktdaten</span>
                <span className="text-charcoal/60">Wettbewerber & TAM verbessern Einschatzung</span>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Privacy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-xl font-semibold text-charcoal mb-4">
            Privatsphare & Datenschutz
          </h2>
          <p className="text-charcoal/60 mb-6">
            Wir haben LaunchOS so gebaut, dass wir gar nicht an deine Daten kommen konnen.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {privacyPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-display font-semibold text-charcoal mb-2">
                      {point.title}
                    </h3>
                    <p className="text-charcoal/60 text-sm">{point.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </PageContainer>
    </div>
  );
};

export default AboutPage;
