import * as React from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, Server, Trash2, Shield, ShieldCheck } from 'lucide-react';
import { SectionHeader } from '@/components/common';

const trustPoints = [
  {
    icon: Server,
    title: 'Analyse im Browser',
    description: 'Die Berechnungen laufen lokal. Gespeichert werden nur Account- und Abrechnungsdaten.',
  },
  {
    icon: Lock,
    title: 'Kostenlos registrieren',
    description: 'Ein Account reicht, um Projekte und Einstellungen zu sichern. 1 Projekt ist gratis.',
  },
  {
    icon: Eye,
    title: 'Open Source',
    description: 'Der gesamte Code ist einsehbar. Du kannst jederzeit prüfen, was mit deinen Daten passiert.',
  },
  {
    icon: Trash2,
    title: 'Export & Kontrolle',
    description: 'Exportiere deine Ergebnisse lokal oder lösche deine Daten, wann immer du willst.',
  },
];

const confidenceTiers = [
  { level: 1, name: 'Minimal', range: '30-50%', fillPercent: 40 },
  { level: 2, name: 'Basic', range: '50-70%', fillPercent: 60 },
  { level: 3, name: 'Detailed', range: '70-85%', fillPercent: 77 },
  { level: 4, name: 'Full', range: '85-95%', fillPercent: 90 },
];

export const TrustSection = () => {
  return (
    <section className="section-padding bg-gradient-to-b from-white to-purple-50/50">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeader
              badge="Privatsphäre"
              title="Deine Idee bleibt deine Idee"
              subtitle="Wir verstehen, dass du deine Idee schützen willst. Deshalb bleibt die Analyse lokal und du behältst die Kontrolle."
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-text-primary mb-1">
                        {point.title}
                      </h4>
                      <p className="text-text-secondary text-sm">{point.description}</p>
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
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-[2rem] blur-2xl" />

            <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-3xl p-8 text-white shadow-xl overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-400/30 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/30 rounded-full blur-2xl" />

              {/* Shield Icon */}
              <div className="relative z-10 flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-white">
                    Du entscheidest
                  </h3>
                  <p className="text-white/70 text-sm">wie viel du teilst</p>
                </div>
              </div>

              {/* Visual Confidence Meter */}
              <div className="relative z-10 space-y-4">
                {confidenceTiers.map((tier, index) => (
                  <motion.div
                    key={tier.level}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="relative"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                          {tier.level}
                        </span>
                        <span className="font-medium text-sm">{tier.name}</span>
                      </div>
                      <span className="text-white/80 text-sm font-medium">{tier.range}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${tier.fillPercent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 + index * 0.15, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          tier.level === 4
                            ? 'bg-gradient-to-r from-pink-400 to-pink-300'
                            : tier.level === 3
                            ? 'bg-gradient-to-r from-white/60 to-white/50'
                            : tier.level === 2
                            ? 'bg-gradient-to-r from-white/40 to-white/30'
                            : 'bg-gradient-to-r from-white/25 to-white/20'
                        }`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Note */}
              <div className="relative z-10 mt-6 pt-4 border-t border-white/20">
                <p className="text-white/70 text-xs text-center flex items-center justify-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  Mehr Daten = höhere Genauigkeit
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
