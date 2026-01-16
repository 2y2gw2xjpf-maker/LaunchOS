import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, AuthCallback } from '@/components/auth';
import { ErrorBoundary, ErrorPage } from '@/components/common/ErrorBoundary';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { VentureProvider } from '@/contexts/VentureContext';

// Lazy load pages for better performance
const LandingPage = React.lazy(() => import('@/pages/Landing'));
const TierSelectionPage = React.lazy(() => import('@/pages/TierSelection'));
const WhatsNextPage = React.lazy(() => import('@/pages/WhatsNext'));
const ValuationPage = React.lazy(() => import('@/pages/Valuation'));
const AboutPage = React.lazy(() => import('@/pages/About'));
const ComparePage = React.lazy(() => import('@/pages/Compare'));
const LoginPage = React.lazy(() => import('@/pages/Login'));
const PricingPage = React.lazy(() => import('@/pages/Pricing'));
const SettingsPage = React.lazy(() => import('@/pages/Settings'));
const VerifyEmailPage = React.lazy(() => import('@/pages/Auth/VerifyEmail'));
const ResetPasswordPage = React.lazy(() => import('@/pages/Auth/ResetPassword'));
const ContactPage = React.lazy(() => import('@/pages/Contact'));
const JourneyPage = React.lazy(() => import('@/pages/Journey'));
const DeliverableLibraryPage = React.lazy(() => import('@/pages/DeliverableLibrary'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 rounded-full border-2 border-brand border-t-transparent animate-spin mx-auto mb-4" />
      <p className="text-charcoal/60">Laden...</p>
    </div>
  </div>
);

export const Router = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <VentureProvider>
            <React.Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/about/*" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Auth Routes */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

              {/* App Routes (public for demo mode) */}
              <Route path="/tier-selection" element={<TierSelectionPage />} />
              <Route path="/whats-next" element={<WhatsNextPage />} />
              <Route path="/valuation" element={<ValuationPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/journey" element={<JourneyPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/deliverables" element={<DeliverableLibraryPage />} />

              {/* App prefixed routes (also public for demo) */}
              <Route path="/app" element={<Navigate to="/tier-selection" replace />} />
              <Route path="/app/journey" element={<JourneyPage />} />
              <Route path="/app/valuation" element={<ValuationPage />} />
              <Route path="/app/whats-next" element={<WhatsNextPage />} />
              <Route path="/app/compare" element={<ComparePage />} />
              <Route path="/app/settings" element={<SettingsPage />} />
              <Route path="/app/deliverables" element={<DeliverableLibraryPage />} />

              {/* 404 Not Found */}
              <Route path="*" element={<ErrorPage />} />
              </Routes>
              <ChatWidget />
            </React.Suspense>
          </VentureProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
