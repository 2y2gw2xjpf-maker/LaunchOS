import { Router } from '@/app/Router';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';
import '@/styles/animations.css';

function App() {
  return (
    <>
      <Router />
      <OfflineBanner />
      <Toaster
        position="bottom-right"
        toastOptions={{
          // Styling passend zum LaunchOS Branding
          style: {
            background: '#1f2937', // gray-800
            color: '#f9fafb', // gray-50
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
          // Erfolg
          success: {
            iconTheme: {
              primary: '#10b981', // green-500 (sage)
              secondary: '#f9fafb',
            },
            duration: 3000,
          },
          // Fehler
          error: {
            iconTheme: {
              primary: '#ef4444', // red-500 (coral)
              secondary: '#f9fafb',
            },
            duration: 5000,
          },
        }}
      />
    </>
  );
}

export default App;
