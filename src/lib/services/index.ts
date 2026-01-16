/**
 * LaunchOS Services Index
 * Zentrale Exports für alle Services
 */

// Deliverable Configs
export {
  DELIVERABLE_CONFIGS,
  getDeliverableConfig,
  getAllDeliverableTypes,
} from './deliverable-configs';
export type { DeliverableConfig } from './deliverable-configs';

// Iteration Service
export {
  IterationService,
  iterationService,
  getQuickAction,
  getAllQuickActions,
  buildIterationPrompt,
  getSuggestedIterations,
} from './iteration-service';
export type { IterationRequest, IterationResult } from './iteration-service';

// Confidence Service
export {
  calculateConfidence,
  getBaselineConfidence,
  getConfidenceLevel,
  getImprovementSuggestions,
  formatConfidence,
  CONFIDENCE_LEVELS,
} from './confidence-service';

// Valuation Service
export {
  calculateValuation,
  formatEuro,
  getApplicableMethods,
  VALUATION_METHODS,
} from './valuation-service';
export type {
  ValuationInput,
  ValuationServiceResult,
} from './valuation-service';
