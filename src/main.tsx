import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initAnalytics } from './lib/analytics';

// Initialize analytics (only runs in production with VITE_POSTHOG_KEY set)
initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
