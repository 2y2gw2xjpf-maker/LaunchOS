import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  // useLayoutEffect runs synchronously before browser paint
  useLayoutEffect(() => {
    // Immediate scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  // Fallback with useEffect for cases where layout effect isn't enough
  useEffect(() => {
    // Small delay to ensure DOM is ready after lazy load
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
