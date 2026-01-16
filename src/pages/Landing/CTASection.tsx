import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Rocket, Sparkles } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Full-width Gradient Background Banner */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600" />

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />

      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative inline-block mb-8"
          >
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
            <div className="relative w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-pink-300 animate-pulse" />
          </motion.div>

          {/* Headline */}
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Bereit für Klarheit?
          </h2>

          {/* Subtext */}
          <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed">
            In wenigen Minuten weißt du, was deine Idee wert ist und welchen Weg du
            einschlagen solltest. <span className="text-pink-200 font-medium">Kostenlos registrieren, 1 Projekt gratis.</span>
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/login">
              <button className="group relative px-8 py-4 bg-white rounded-xl font-bold text-lg text-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                <span className="flex items-center gap-2">
                  Kostenlos registrieren
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
            <Link to="/about/methodology">
              <button className="px-8 py-4 rounded-xl font-semibold text-lg text-white border-2 border-white/30 hover:bg-white/10 transition-all hover:border-white/50">
                Mehr erfahren
              </button>
            </Link>
          </div>

          {/* Trust Note */}
          <p className="text-white/70 text-sm">
            Registrierung in Minuten. Einstellungen & Abrechnung erst nach Login.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
