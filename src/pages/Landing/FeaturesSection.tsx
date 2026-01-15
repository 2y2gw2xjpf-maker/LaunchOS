import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  LineChart,
  CheckCircle,
  ArrowRight,
  Target,
} from 'lucide-react';
import { SectionHeader } from '@/components/common';

const features = [
  {
    icon: Target,
    title: 'Klare Empfehlung',
    description:
      'Bootstrap oder Investor? Basierend auf deiner Situation, nicht generischen Ratschlagen.',
    color: 'brand',
  },
  {
    icon: LineChart,
    title: '5 Bewertungsmethoden',
    description:
      'Berkus, Scorecard, VC Method, Comparables, DCF - alle an einem Ort mit transparenten Berechnungen.',
    color: 'accent',
  },
  {
    icon: CheckCircle,
    title: 'Konkrete Action Plans',
    description:
      'Nicht nur "was", sondern "wie" und "wann". Mit Budget-Schatzungen und Ressourcen.',
    color: 'brand',
  },
  {
    icon: Shield,
    title: '100% Lokal',
    description:
      'Deine Daten verlassen nie deinen Browser. Keine Server, keine Accounts, keine Sorgen.',
    color: 'accent',
  },
  {
    icon: Zap,
    title: 'Transparente Confidence',
    description:
      'Wir sagen dir ehrlich, wie sicher unsere Analyse ist - und was du tun kannst, um sie zu verbessern.',
    color: 'brand',
  },
  {
    icon: ArrowRight,
    title: 'Du entscheidest',
    description:
      'Teile so viel oder so wenig wie du willst. Wir passen die Analyse-Tiefe entsprechend an.',
    color: 'accent',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-wide">
        <SectionHeader
          badge="Features"
          title="Alles was du brauchst"
          subtitle="Von der ersten Idee bis zur fundierten Entscheidung - LaunchOS begleitet dich durch den gesamten Prozess."
          align="center"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              brand: 'bg-brand-100 text-brand-600',
              accent: 'bg-accent-100 text-accent-600',
            };

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border-2 border-brand-100 hover:border-brand-300 hover:shadow-glow-brand bg-white/80 backdrop-blur-sm transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-lg text-charcoal mb-2">
                  {feature.title}
                </h3>
                <p className="text-charcoal/60">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
