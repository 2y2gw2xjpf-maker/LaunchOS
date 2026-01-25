/**
 * LaunchOS Venture Context
 * Globaler State für das aktive Venture und Demo-Ventures
 */

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useVentures } from '@/hooks/useVentures';
import { useDemoVentures } from '@/hooks/useDemoVentures';
import type { Venture, UseVenturesReturn, TierData } from '@/hooks/useVentures';
import type { DemoVenture } from '@/data/demoVentures';

// ==================== TYPES ====================

export interface VentureContextValue extends UseVenturesReturn {
  // Demo-Venture Felder
  demoVentures: DemoVenture[];
  activeDemoVenture: DemoVenture | null;
  isDemoMode: boolean;
  enterDemoMode: (ventureId: string) => void;
  exitDemoMode: () => void;
  /** Kombinierte Liste aller Ventures (echte + Demo) */
  allVentures: (Venture | DemoVenture)[];
  /** Prüft ob ein Venture ein Demo-Venture ist */
  isDemo: (venture: Venture) => venture is DemoVenture;
}

// ==================== CONTEXT ====================

const VentureContext = createContext<VentureContextValue | undefined>(undefined);

// ==================== PROVIDER ====================

interface VentureProviderProps {
  children: ReactNode;
}

export function VentureProvider({ children }: VentureProviderProps) {
  const ventureState = useVentures();
  const demoState = useDemoVentures();

  // Kombiniere echte und Demo-Ventures
  const allVentures = useMemo(() => {
    return [...ventureState.ventures, ...demoState.demoVentures];
  }, [ventureState.ventures, demoState.demoVentures]);

  // Kombinierter Context-Wert
  const contextValue: VentureContextValue = useMemo(() => ({
    // Alle Felder von useVentures
    ...ventureState,
    // Demo-Venture Felder
    demoVentures: demoState.demoVentures,
    activeDemoVenture: demoState.activeDemoVenture,
    isDemoMode: demoState.isDemoMode,
    enterDemoMode: demoState.enterDemoMode,
    exitDemoMode: demoState.exitDemoMode,
    // Kombinierte Liste
    allVentures,
    isDemo: demoState.isDemo,
  }), [ventureState, demoState, allVentures]);

  return (
    <VentureContext.Provider value={contextValue}>
      {children}
    </VentureContext.Provider>
  );
}

// ==================== HOOKS ====================

export function useVentureContext(): VentureContextValue {
  const context = useContext(VentureContext);
  if (!context) {
    throw new Error('useVentureContext must be used within VentureProvider');
  }
  return context;
}

// Optional: Hook das null zurückgibt wenn kein Provider vorhanden
export function useOptionalVentureContext(): VentureContextValue | null {
  const context = useContext(VentureContext);
  return context || null;
}

// Re-export types
export type { Venture, TierData, DemoVenture };
