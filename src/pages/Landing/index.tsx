import * as React from 'react';
import { Header, Footer } from '@/components/layout';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { TrustSection } from './TrustSection';
import { CTASection } from './CTASection';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="pt-20">
        <HeroSection />
        <FeaturesSection />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
