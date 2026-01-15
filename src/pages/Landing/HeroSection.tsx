import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Calculator, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -left-40 w-96 h-96 bg-sage/10 rounded-full blur-3xl" />
      </div>

      <div className="container-wide relative z-10">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy/5 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-navy">
                Fur Solo-Grunder, die Klarheit brauchen
              </span>
            </div>

            <h1 className="font-display text-display-lg md:text-display-xl text-navy mb-6">
              Dein Operating System{' '}
              <span className="relative">
                <span className="relative z-10">fur den Launch</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                >
                  <path
                    d="M2 10C50 2 150 2 298 10"
                    stroke="#F5A623"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-xl text-charcoal/70 mb-8 max-w-2xl">
              Finde heraus, was deine Idee wirklich wert ist. Ob Bootstrapping oder
              Investor der richtige Weg ist. Und was du als nachstes konkret tun solltest.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/tier-selection">
                <Button variant="gold" size="lg">
                  Jetzt starten
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/about/methodology">
                <Button variant="secondary" size="lg">Wie funktioniert es?</Button>
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
              className="group p-6 bg-white rounded-2xl border-2 border-navy/10 hover:border-sage/50 hover:shadow-medium transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-sage/10 flex items-center justify-center mb-4 group-hover:bg-sage/20 transition-colors">
                <Compass className="w-6 h-6 text-sage" />
              </div>
              <h3 className="font-display font-semibold text-lg text-navy mb-2">
                Was tun?
              </h3>
              <p className="text-charcoal/60">
                Bootstrap oder Investor? Personalisierter Action Plan basierend auf deiner
                Situation.
              </p>
            </Link>

            <Link
              to="/valuation"
              className="group p-6 bg-white rounded-2xl border-2 border-navy/10 hover:border-gold/50 hover:shadow-medium transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                <Calculator className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display font-semibold text-lg text-navy mb-2">
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
