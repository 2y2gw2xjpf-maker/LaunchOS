import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Calculator, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background decoration - Lovable Lavender theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -left-40 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-100/30 rounded-full blur-3xl" />
      </div>

      <div className="container-wide relative z-10">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-medium text-brand-700">
                Für Solo-Gründer, die Klarheit brauchen
              </span>
            </div>

            <h1 className="font-display text-display-lg md:text-display-xl text-charcoal mb-6">
              Dein Operating System{' '}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">für den Launch</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                >
                  <path
                    d="M2 10C50 2 150 2 298 10"
                    stroke="url(#brand-gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="text-xl text-charcoal/70 mb-8 max-w-2xl">
              Finde heraus, was deine Idee wirklich wert ist. Ob Bootstrapping oder
              Investor der richtige Weg ist. Und was du als nächstes konkret tun solltest.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/tier-selection">
                <Button variant="primary" size="lg" className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-glow-brand">
                  Jetzt starten
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/about/methodology">
                <Button variant="secondary" size="lg" className="border-brand-200 text-brand-700 hover:bg-brand-50">Wie funktioniert es?</Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            <Link
              to="/whats-next"
              className="group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-brand-100 hover:border-brand-300 hover:shadow-glow-brand transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center mb-4 group-hover:from-brand-200 group-hover:to-accent-200 transition-colors">
                <Compass className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-display font-semibold text-lg text-charcoal mb-2">
                Was tun?
              </h3>
              <p className="text-charcoal/60">
                Bootstrap oder Investor? Personalisierter Action Plan basierend auf deiner
                Situation.
              </p>
            </Link>

            <Link
              to="/valuation"
              className="group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-accent-100 hover:border-accent-300 hover:shadow-glow-accent transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-100 to-brand-100 flex items-center justify-center mb-4 group-hover:from-accent-200 group-hover:to-brand-200 transition-colors">
                <Calculator className="w-6 h-6 text-accent-600" />
              </div>
              <h3 className="font-display font-semibold text-lg text-charcoal mb-2">
                Bewertung
              </h3>
              <p className="text-charcoal/60">
                5 professionelle Methoden zur Startup-Bewertung. Transparent und nachvollziehbar.
              </p>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
