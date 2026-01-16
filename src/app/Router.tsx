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

              {/* Protected App Routes - require authentication */}
              <Route path="/tier-selection" element={<ProtectedRoute><TierSelectionPage /></ProtectedRoute>} />
              <Route path="/whats-next" element={<ProtectedRoute><WhatsNextPage /></ProtectedRoute>} />
              <Route path="/valuation" element={<ProtectedRoute><ValuationPage /></ProtectedRoute>} />
              <Route path="/compare" element={<ProtectedRoute><ComparePage /></ProtectedRoute>} />
              <Route path="/journey" element={<ProtectedRoute><JourneyPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/settings/*" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/deliverables" element={<ProtectedRoute><DeliverableLibraryPage /></ProtectedRoute>} />

              {/* App prefixed routes - also protected */}
              <Route path="/app" element={<ProtectedRoute><Navigate to="/tier-selection" replace /></ProtectedRoute>} />
              <Route path="/app/journey" element={<ProtectedRoute><JourneyPage /></ProtectedRoute>} />
              <Route path="/app/valuation" element={<ProtectedRoute><ValuationPage /></ProtectedRoute>} />
              <Route path="/app/whats-next" element={<ProtectedRoute><WhatsNextPage /></ProtectedRoute>} />
              <Route path="/app/compare" element={<ProtectedRoute><ComparePage /></ProtectedRoute>} />
              <Route path="/app/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/app/settings/*" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/app/deliverables" element={<ProtectedRoute><DeliverableLibraryPage /></ProtectedRoute>} />

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
