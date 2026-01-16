import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Calculator, Sparkles, Shield, Zap } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50" />

      {/* Decorative Blobs */}
      <div className="blob-purple w-96 h-96 top-20 -right-20" />
      <div className="blob-pink w-80 h-80 bottom-20 -left-20" />
      <div className="blob-purple w-64 h-64 top-1/2 left-1/3 opacity-20" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, #9333ea 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="badge-gradient animate-float">
              <Sparkles className="w-4 h-4" />
              <span>Für Solo-Gründer, die Klarheit brauchen</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-center mb-6 leading-tight">
            <span className="text-text-primary">Dein Operating System</span>
            <br />
            <span className="relative inline-block mt-2">
              <span className="gradient-text">für den Launch</span>
              {/* Animated Underline */}
              <svg
                className="absolute -bottom-3 left-0 w-full h-4"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 8 Q 75 0, 150 8 T 300 8"
                  stroke="url(#underline-gradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-center text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
            Finde heraus, was deine Idee wirklich wert ist. Ob Bootstrapping oder
            Investor der richtige Weg ist. Und was du als nächstes konkret tun solltest.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link to="/login">
              <button className="btn-primary group">
                <span className="flex items-center gap-2">
                  Kostenlos registrieren
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
            <Link to="/about/methodology">
              <button className="btn-secondary">
                Wie funktioniert es?
              </button>
            </Link>
          </div>

          <p className="text-center text-text-muted mb-10">
            1 Projekt gratis. Einstellungen & Abrechnung erst nach Login.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted mb-16">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full">
              <Shield className="w-4 h-4 text-purple-500" />
              <span>Analyse lokal</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full">
              <Zap className="w-4 h-4 text-pink-500" />
              <span>Account nur fürs Dashboard</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full">
              <span>🔒</span>
              <span>Deine Daten bleiben bei dir</span>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {/* What's Next Card */}
          <Link to="/whats-next" className="card-interactive group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Compass className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-2xl font-display font-bold text-text-primary mb-3">
              Was tun?
            </h3>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Bootstrap oder Investor? Personalisierter Action Plan
              basierend auf deiner Situation.
            </p>
            <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
              <span>Navigator starten</span>
              <ArrowRight className="w-4 h-4" />
            </div>

            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </Link>

          {/* Valuation Card */}
          <Link to="/valuation" className="card-interactive group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Calculator className="w-7 h-7 text-pink-600" />
            </div>
            <h3 className="text-2xl font-display font-bold text-text-primary mb-3">
              Bewertung
            </h3>
            <p className="text-text-secondary mb-6 leading-relaxed">
              5 professionelle Methoden zur Startup-Bewertung.
              Transparent und nachvollziehbar.
            </p>
            <div className="flex items-center gap-2 text-pink-600 font-semibold group-hover:gap-3 transition-all">
              <span>Bewertung starten</span>
              <ArrowRight className="w-4 h-4" />
            </div>

            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
