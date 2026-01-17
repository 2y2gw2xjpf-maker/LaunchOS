import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initAnalytics } from './lib/analytics';

// Initialize analytics (only runs in production with VITE_POSTHOG_KEY set)
try {
  initAnalytics();
} catch (e) {
  console.error('[LaunchOS] Analytics init failed:', e);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[LaunchOS] Root element not found!');
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (e) {
    console.error('[LaunchOS] App mount failed:', e);
    rootElement.innerHTML = '<div style="padding:20px;color:red;">App failed to load. Check console.</div>';
  }
}
