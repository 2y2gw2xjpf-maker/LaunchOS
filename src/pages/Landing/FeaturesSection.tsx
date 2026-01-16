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
    color: 'purple',
  },
  {
    icon: LineChart,
    title: '5 Bewertungsmethoden',
    description:
      'Berkus, Scorecard, VC Method, Comparables, DCF - alle an einem Ort mit transparenten Berechnungen.',
    color: 'pink',
  },
  {
    icon: CheckCircle,
    title: 'Konkrete Action Plans',
    description:
      'Nicht nur "was", sondern "wie" und "wann". Mit Budget-Schatzungen und Ressourcen.',
    color: 'purple',
  },
  {
    icon: Shield,
    title: '100% Lokal',
    description:
      'Deine Daten verlassen nie deinen Browser. Keine Server, keine Accounts, keine Sorgen.',
    color: 'pink',
  },
  {
    icon: Zap,
    title: 'Transparente Confidence',
    description:
      'Wir sagen dir ehrlich, wie sicher unsere Analyse ist - und was du tun kannst, um sie zu verbessern.',
    color: 'purple',
  },
  {
    icon: ArrowRight,
    title: 'Du entscheidest',
    description:
      'Teile so viel oder so wenig wie du willst. Wir passen die Analyse-Tiefe entsprechend an.',
    color: 'pink',
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="section-padding bg-gradient-to-b from-white to-purple-50/30">
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
              purple: 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600',
              pink: 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600',
            };

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10 bg-white/80 backdrop-blur-sm transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
