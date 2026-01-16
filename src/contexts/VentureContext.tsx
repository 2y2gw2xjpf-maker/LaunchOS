/**
 * LaunchOS Venture Context
 * Globaler State für das aktive Venture
 */

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useVentures } from '@/hooks/useVentures';
import type { Venture, UseVenturesReturn } from '@/hooks/useVentures';

// ==================== CONTEXT ====================

const VentureContext = createContext<UseVenturesReturn | undefined>(undefined);

// ==================== PROVIDER ====================

interface VentureProviderProps {
  children: ReactNode;
}

export function VentureProvider({ children }: VentureProviderProps) {
  const ventureState = useVentures();

  return (
    <VentureContext.Provider value={ventureState}>
      {children}
    </VentureContext.Provider>
  );
}

// ==================== HOOK ====================

export function useVentureContext(): UseVenturesReturn {
  const context = useContext(VentureContext);
  if (!context) {
    throw new Error('useVentureContext must be used within VentureProvider');
  }
  return context;
}

// Optional: Hook das null zurückgibt wenn kein Provider vorhanden
export function useOptionalVentureContext(): UseVenturesReturn | null {
  const context = useContext(VentureContext);
  return context || null;
}

// Re-export types
export type { Venture };
