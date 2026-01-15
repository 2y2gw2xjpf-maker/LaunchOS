import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Lazy load pages for better performance
const LandingPage = React.lazy(() => import('@/pages/Landing'));
const TierSelectionPage = React.lazy(() => import('@/pages/TierSelection'));
const WhatsNextPage = React.lazy(() => import('@/pages/WhatsNext'));
const ValuationPage = React.lazy(() => import('@/pages/Valuation'));
const AboutPage = React.lazy(() => import('@/pages/About'));
const ComparePage = React.lazy(() => import('@/pages/Compare'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 rounded-full border-2 border-navy border-t-transparent animate-spin mx-auto mb-4" />
      <p className="text-charcoal/60">Laden...</p>
    </div>
  </div>
);

export const Router = () => {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/tier-selection" element={<TierSelectionPage />} />
          <Route path="/whats-next" element={<WhatsNextPage />} />
          <Route path="/valuation" element={<ValuationPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/*" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
};
