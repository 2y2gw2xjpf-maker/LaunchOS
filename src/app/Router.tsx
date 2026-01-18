import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, AuthCallback } from '@/components/auth';
import { ErrorBoundary, ErrorPage } from '@/components/common/ErrorBoundary';
import { ScrollToTop } from '@/components/common';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { VentureProvider } from '@/contexts/VentureContext';

// Lazy load pages for better performance
const LandingPage = React.lazy(() => import('@/pages/Landing'));
const DashboardPage = React.lazy(() => import('@/pages/Dashboard'));
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
const InvestorCRMPage = React.lazy(() => import('@/pages/InvestorCRM'));
const DataRoomPage = React.lazy(() => import('@/pages/DataRoom'));
const PublicDataRoomPage = React.lazy(() => import('@/pages/DataRoom/PublicDataRoom'));
const AnalyticsPage = React.lazy(() => import('@/pages/Analytics'));

// Legal Pages
const ImpressumPage = React.lazy(() => import('@/pages/Legal/ImpressumPage'));
const DatenschutzPage = React.lazy(() => import('@/pages/Legal/DatenschutzPage'));

// Builder's Toolkit
const ToolkitPage = React.lazy(() => import('@/pages/Toolkit'));
const GuidesPage = React.lazy(() => import('@/pages/Toolkit/GuidesPage'));
const GuideDetailPage = React.lazy(() => import('@/pages/Toolkit/GuideDetailPage'));
const ChecklistsPage = React.lazy(() => import('@/pages/Toolkit/ChecklistsPage'));
const ChecklistDetailPage = React.lazy(() => import('@/pages/Toolkit/ChecklistDetailPage'));
const PromptsPage = React.lazy(() => import('@/pages/Toolkit/PromptsPage'));
const PromptDetailPage = React.lazy(() => import('@/pages/Toolkit/PromptDetailPage'));
const ToolsPage = React.lazy(() => import('@/pages/Toolkit/ToolsPage'));
const ToolDetailPage = React.lazy(() => import('@/pages/Toolkit/ToolDetailPage'));
const ToolComparePage = React.lazy(() => import('@/pages/Toolkit/ToolComparePage'));
const PitfallsPage = React.lazy(() => import('@/pages/Toolkit/PitfallsPage'));

// Launch Pages
const LaunchChecklistPage = React.lazy(() => import('@/pages/Launch/LaunchChecklistPage'));
const AnnouncementPage = React.lazy(() => import('@/pages/Launch/AnnouncementPage'));

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
        <ScrollToTop />
        <AuthProvider>
          <VentureProvider>
            <React.Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/about/methodology" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Legal Pages (Public) */}
              <Route path="/impressum" element={<ImpressumPage />} />
              <Route path="/datenschutz" element={<DatenschutzPage />} />
              {/* Redirects for old paths */}
              <Route path="/about/imprint" element={<Navigate to="/impressum" replace />} />
              <Route path="/about/privacy" element={<Navigate to="/datenschutz" replace />} />

              {/* Auth Routes */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

              {/* Protected App Routes - require authentication */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/tier-selection" element={<ProtectedRoute><TierSelectionPage /></ProtectedRoute>} />
              <Route path="/whats-next" element={<ProtectedRoute><WhatsNextPage /></ProtectedRoute>} />
              <Route path="/valuation" element={<ProtectedRoute><ValuationPage /></ProtectedRoute>} />
              <Route path="/compare" element={<ProtectedRoute><ComparePage /></ProtectedRoute>} />
              <Route path="/journey" element={<ProtectedRoute><JourneyPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/settings/*" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/deliverables" element={<ProtectedRoute><DeliverableLibraryPage /></ProtectedRoute>} />
              <Route path="/investors" element={<ProtectedRoute><InvestorCRMPage /></ProtectedRoute>} />
              <Route path="/data-room" element={<ProtectedRoute><DataRoomPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />

              {/* Builder's Toolkit Routes */}
              <Route path="/toolkit" element={<ProtectedRoute><ToolkitPage /></ProtectedRoute>} />
              <Route path="/toolkit/guides" element={<ProtectedRoute><GuidesPage /></ProtectedRoute>} />
              <Route path="/toolkit/guides/:slug" element={<ProtectedRoute><GuideDetailPage /></ProtectedRoute>} />
              <Route path="/toolkit/checklists" element={<ProtectedRoute><ChecklistsPage /></ProtectedRoute>} />
              <Route path="/toolkit/checklists/:slug" element={<ProtectedRoute><ChecklistDetailPage /></ProtectedRoute>} />
              <Route path="/toolkit/prompts" element={<ProtectedRoute><PromptsPage /></ProtectedRoute>} />
              <Route path="/toolkit/prompts/:slug" element={<ProtectedRoute><PromptDetailPage /></ProtectedRoute>} />
              <Route path="/toolkit/tools" element={<ProtectedRoute><ToolsPage /></ProtectedRoute>} />
              <Route path="/toolkit/tools/compare" element={<ProtectedRoute><ToolComparePage /></ProtectedRoute>} />
              <Route path="/toolkit/tools/:slug" element={<ProtectedRoute><ToolDetailPage /></ProtectedRoute>} />
              <Route path="/toolkit/pitfalls" element={<ProtectedRoute><PitfallsPage /></ProtectedRoute>} />

              {/* Launch Routes */}
              <Route path="/launch/checklist" element={<ProtectedRoute><LaunchChecklistPage /></ProtectedRoute>} />
              <Route path="/launch/announcement" element={<ProtectedRoute><AnnouncementPage /></ProtectedRoute>} />

              {/* Public Data Room Access */}
              <Route path="/data-room/view/:token" element={<PublicDataRoomPage />} />

              {/* App prefixed routes - also protected */}
              <Route path="/app" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
              <Route path="/app/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/app/journey" element={<ProtectedRoute><JourneyPage /></ProtectedRoute>} />
              <Route path="/app/valuation" element={<ProtectedRoute><ValuationPage /></ProtectedRoute>} />
              <Route path="/app/whats-next" element={<ProtectedRoute><WhatsNextPage /></ProtectedRoute>} />
              <Route path="/app/compare" element={<ProtectedRoute><ComparePage /></ProtectedRoute>} />
              <Route path="/app/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/app/settings/*" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/app/deliverables" element={<ProtectedRoute><DeliverableLibraryPage /></ProtectedRoute>} />
              <Route path="/app/investors" element={<ProtectedRoute><InvestorCRMPage /></ProtectedRoute>} />
              <Route path="/app/data-room" element={<ProtectedRoute><DataRoomPage /></ProtectedRoute>} />
              <Route path="/app/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />

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
