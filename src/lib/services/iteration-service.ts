/**
 * LaunchOS Iteration Service
 * Ermöglicht schnelle Anpassungen an Deliverables
 */

import { QUICK_ACTIONS, type QuickAction, type Deliverable, type DeliverableType } from '@/types';
import { getDeliverableConfig } from './deliverable-configs';

export interface IterationRequest {
  deliverableId: string;
  deliverableType: DeliverableType;
  currentContent: string;
  action: QuickAction | string; // Quick Action oder custom Prompt
  context?: Record<string, unknown>;
}

export interface IterationResult {
  success: boolean;
  updatedContent: string;
  changesSummary: string;
  metadata: {
    action: string;
    timestamp: string;
    version: number;
  };
}

/**
 * Holt eine Quick Action anhand der ID
 */
export function getQuickAction(actionId: string): QuickAction | undefined {
  return QUICK_ACTIONS.find((a) => a.id === actionId);
}

/**
 * Alle Quick Actions
 */
export function getAllQuickActions(): QuickAction[] {
  return QUICK_ACTIONS;
}

/**
 * Erstellt den Iteration Prompt für die KI
 */
export function buildIterationPrompt(request: IterationRequest): string {
  const config = getDeliverableConfig(request.deliverableType);
  const actionPrompt = typeof request.action === 'string'
    ? request.action
    : request.action.prompt;

  return `Du bist LaunchOS. Der User möchte ein bestehendes ${config.title} anpassen.

## Aktuelle Version:
${request.currentContent}

## Gewünschte Änderung:
${actionPrompt}

## Anweisungen:
1. Führe NUR die gewünschte Änderung durch
2. Behalte Struktur und Format bei
3. Erkläre kurz was du geändert hast

Gib die aktualisierte Version zurück.`;
}

/**
 * Erstellt Iteration-Vorschläge basierend auf dem Deliverable-Typ
 */
export function getSuggestedIterations(deliverableType: DeliverableType): QuickAction[] {
  // Basis-Actions für alle
  const baseActions = [
    getQuickAction('shorten'),
    getQuickAction('expand'),
    getQuickAction('simplify'),
  ].filter(Boolean) as QuickAction[];

  // Typ-spezifische Empfehlungen
  switch (deliverableType) {
    case 'pitch_deck':
      return [
        ...baseActions,
        getQuickAction('translate_en'),
        getQuickAction('executive_summary'),
      ].filter(Boolean) as QuickAction[];

    case 'business_plan':
      return [
        ...baseActions,
        getQuickAction('executive_summary'),
        getQuickAction('formal'),
      ].filter(Boolean) as QuickAction[];

    case 'outreach_emails':
      return [
        getQuickAction('shorten'),
        getQuickAction('casual'),
        getQuickAction('formal'),
        getQuickAction('translate_en'),
      ].filter(Boolean) as QuickAction[];

    case 'legal_docs':
      return [
        getQuickAction('formal'),
        getQuickAction('simplify'),
        getQuickAction('translate_en'),
      ].filter(Boolean) as QuickAction[];

    default:
      return baseActions;
  }
}

/**
 * Iteration Service Klasse
 * Verwaltet Deliverable-Iterationen
 */
export class IterationService {
  private deliverables: Map<string, Deliverable> = new Map();

  /**
   * Lädt ein Deliverable für Iteration
   */
  loadDeliverable(deliverable: Deliverable): void {
    this.deliverables.set(deliverable.id, deliverable);
  }

  /**
   * Holt das aktuelle Deliverable
   */
  getDeliverable(id: string): Deliverable | undefined {
    return this.deliverables.get(id);
  }

  /**
   * Bereitet eine Iteration vor
   */
  prepareIteration(
    deliverableId: string,
    action: QuickAction | string
  ): IterationRequest | null {
    const deliverable = this.deliverables.get(deliverableId);
    if (!deliverable) return null;

    const currentContent = typeof deliverable.content === 'string'
      ? deliverable.content
      : JSON.stringify(deliverable.content, null, 2);

    return {
      deliverableId,
      deliverableType: deliverable.type,
      currentContent,
      action,
      context: deliverable.metadata,
    };
  }

  /**
   * Wendet Iteration an und erhöht Version
   */
  applyIteration(
    deliverableId: string,
    updatedContent: string,
    actionLabel: string
  ): Deliverable | null {
    const deliverable = this.deliverables.get(deliverableId);
    if (!deliverable) return null;

    const updated: Deliverable = {
      ...deliverable,
      content: { text: updatedContent },
      version: deliverable.version + 1,
      updatedAt: new Date().toISOString(),
      metadata: {
        ...deliverable.metadata,
        lastAction: actionLabel,
        lastActionAt: new Date().toISOString(),
      },
    };

    this.deliverables.set(deliverableId, updated);
    return updated;
  }

  /**
   * Gibt verfügbare Iterations für ein Deliverable zurück
   */
  getAvailableIterations(deliverableId: string): QuickAction[] {
    const deliverable = this.deliverables.get(deliverableId);
    if (!deliverable) return getAllQuickActions();
    return getSuggestedIterations(deliverable.type);
  }
}

// Singleton Instance
export const iterationService = new IterationService();

export default IterationService;
