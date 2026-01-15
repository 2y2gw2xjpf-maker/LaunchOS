import * as React from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, Server, Trash2 } from 'lucide-react';
import { SectionHeader } from '@/components/common';

const trustPoints = [
  {
    icon: Server,
    title: 'Keine Server',
    description: 'Alle Berechnungen passieren direkt in deinem Browser. Wir haben keine Server, auf denen wir Daten speichern konnten.',
  },
  {
    icon: Lock,
    title: 'Keine Accounts',
    description: 'Du brauchst keinen Account. Keine E-Mail, kein Passwort, nichts. Einfach starten.',
  },
  {
    icon: Eye,
    title: 'Open Source',
    description: 'Der gesamte Code ist einsehbar. Du kannst jederzeit prufen, was mit deinen Daten passiert.',
  },
  {
    icon: Trash2,
    title: 'Session-basiert',
    description: 'Schliesse den Tab und alles ist weg. Oder exportiere deine Ergebnisse lokal - du entscheidest.',
  },
];

export const TrustSection = () => {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeader
              badge="Privatsphare"
              title="Deine Idee bleibt deine Idee"
              subtitle="Wir verstehen, dass du deine Idee schutzen willst. Deshalb haben wir LaunchOS so gebaut, dass wir gar nicht an deine Daten kommen."
            />

            <div className="space-y-6">
              {trustPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={point.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-navy mb-1">
                        {point.title}
                      </h4>
                      <p className="text-charcoal/60 text-sm">{point.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-navy rounded-3xl p-8 text-white">
              <div className="absolute top-4 right-4 w-20 h-20 bg-gold/20 rounded-full blur-xl" />

              <h3 className="font-display text-2xl font-semibold mb-4 relative z-10">
                Du entscheidest,
                <br />
                wie viel du teilst
              </h3>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-sm font-semibold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Minimal</p>
                    <p className="text-white/60 text-sm">30-50% Confidence</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm font-semibold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Basic</p>
                    <p className="text-white/60 text-sm">50-70% Confidence</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                    <span className="text-sm font-semibold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Detailed</p>
                    <p className="text-white/60 text-sm">70-85% Confidence</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy">
                    <span className="text-sm font-semibold">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Full</p>
                    <p className="text-white/60 text-sm">85-95% Confidence</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
