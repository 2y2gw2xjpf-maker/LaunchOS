import { Router } from '@/app/Router';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import '@/styles/globals.css';
import '@/styles/animations.css';

function App() {
  return (
    <>
      <Router />
      <OfflineBanner />
    </>
  );
}

export default App;
