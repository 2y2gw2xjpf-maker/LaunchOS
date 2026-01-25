/**
 * useDemoVentures Hook
 * Verwaltet Demo-Venture State und Demo-Modus
 */

import { useState, useCallback, useMemo } from 'react';
import { DEMO_VENTURES, isDemoVenture, type DemoVenture } from '@/data/demoVentures';
import type { Venture } from '@/hooks/useVentures';

export interface UseDemoVenturesReturn {
  /** Alle verfügbaren Demo-Ventures */
  demoVentures: DemoVenture[];
  /** Aktuell aktives Demo-Venture (wenn im Demo-Modus) */
  activeDemoVenture: DemoVenture | null;
  /** Ob der Demo-Modus aktiv ist */
  isDemoMode: boolean;
  /** Demo-Modus für ein bestimmtes Venture aktivieren */
  enterDemoMode: (ventureId: string) => void;
  /** Demo-Modus verlassen */
  exitDemoMode: () => void;
  /** Demo-Venture anhand ID holen */
  getDemoVenture: (id: string) => DemoVenture | undefined;
  /** Prüfen ob ein Venture ein Demo-Venture ist */
  isDemo: (venture: Venture) => venture is DemoVenture;
}

export function useDemoVentures(): UseDemoVenturesReturn {
  const [activeDemoVentureId, setActiveDemoVentureId] = useState<string | null>(null);

  const activeDemoVenture = useMemo(() => {
    if (!activeDemoVentureId) return null;
    return DEMO_VENTURES.find(v => v.id === activeDemoVentureId) || null;
  }, [activeDemoVentureId]);

  const enterDemoMode = useCallback((ventureId: string) => {
    // Nur Demo-Ventures erlauben
    const demoVenture = DEMO_VENTURES.find(v => v.id === ventureId);
    if (demoVenture) {
      setActiveDemoVentureId(ventureId);
      console.log('[Demo] Entered demo mode:', demoVenture.name);
    } else {
      console.warn('[Demo] Attempted to enter demo mode with non-demo venture:', ventureId);
    }
  }, []);

  const exitDemoMode = useCallback(() => {
    setActiveDemoVentureId(null);
    console.log('[Demo] Exited demo mode');
  }, []);

  const getDemoVenture = useCallback((id: string): DemoVenture | undefined => {
    return DEMO_VENTURES.find(v => v.id === id);
  }, []);

  return {
    demoVentures: DEMO_VENTURES,
    activeDemoVenture,
    isDemoMode: activeDemoVentureId !== null,
    enterDemoMode,
    exitDemoMode,
    getDemoVenture,
    isDemo: isDemoVenture,
  };
}

export default useDemoVentures;
