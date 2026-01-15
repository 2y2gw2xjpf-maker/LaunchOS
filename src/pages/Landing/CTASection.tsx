import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Rocket } from 'lucide-react';
import { Button } from '@/components/ui';

export const CTASection = () => {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 rounded-3xl p-8 md:p-16 text-white overflow-hidden"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-8 h-8 text-white" />
            </div>

            <h2 className="font-display text-display-sm md:text-display-md mb-4">
              Bereit fur Klarheit?
            </h2>

            <p className="text-white/80 text-lg mb-8">
              In wenigen Minuten weisst du, was deine Idee wert ist und welchen Weg du
              einschlagen solltest. Kostenlos und ohne Account.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tier-selection">
                <Button variant="secondary" size="lg" className="bg-white text-brand-700 hover:bg-white/90 border-0">
                  Jetzt starten
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/about/methodology">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Mehr erfahren
                </Button>
              </Link>
            </div>

            <p className="text-white/60 text-sm mt-8">
              Keine Anmeldung erforderlich. Deine Daten bleiben lokal.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
