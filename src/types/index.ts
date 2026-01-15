// ==================== TIERS ====================
export type DataSharingTier = 'minimal' | 'basic' | 'detailed' | 'full';

export interface TierConfig {
  tier: DataSharingTier;
  label: string;
  description: string;
  whatWeAsk: string[];
  whatWeNeverAsk: string[];
  confidenceRange: [number, number];
  analysisDepth: string;
  example: string;
}

export interface TierSelection {
  tier: DataSharingTier;
  selectedAt: Date;
  acknowledgedPrivacy: boolean;
}

// ==================== WIZARD ====================
export type ProjectCategory =
  | 'saas'
  | 'marketplace'
  | 'ecommerce'
  | 'content'
  | 'service'
  | 'hardware'
  | 'fintech'
  | 'healthtech'
  | 'edtech'
  | 'other';

export type ProjectStage = 'idea' | 'mvp' | 'beta' | 'live' | 'scaling';

export type TargetCustomer = 'b2b' | 'b2c' | 'both' | 'b2b2c';

export type TeamSize = 'solo' | 'cofounders' | 'small_team' | 'larger_team';

export type Commitment = 'fulltime' | 'parttime' | 'side_project';

export type ExitGoal = 'lifestyle' | 'acquisition' | 'ipo' | 'unsure';

export type GrowthSpeed = 'slow_steady' | 'moderate' | 'aggressive' | 'hypergrowth';

export type TimeHorizon = '1_year' | '3_years' | '5_years' | '10_plus';

export type FinancialSituation = 'bootstrapped' | 'some_savings' | 'comfortable' | 'significant';

export interface ProjectBasics {
  category: ProjectCategory;
  categoryOther?: string;
  stage: ProjectStage;
  targetCustomer: TargetCustomer;
  hasRevenue: boolean;
  monthlyRevenue?: number;
  revenueGrowthRate?: number;
  hasUsers: boolean;
  userCount?: number;
  userGrowthRate?: number;
  launchDate?: string;
}

export interface PersonalSituation {
  teamSize: TeamSize;
  cofoundersCount?: number;
  hasRelevantExperience: boolean;
  yearsExperience?: number;
  commitment: Commitment;
  hoursPerWeek?: number;
  runwayMonths: number;
  financialSituation: FinancialSituation;
  riskTolerance: number;
  hasOtherIncome: boolean;
}

export interface Goals {
  exitGoal: ExitGoal;
  targetExitValue?: number;
  growthSpeed: GrowthSpeed;
  controlImportance: number;
  timeHorizon: TimeHorizon;
  openToInvestors: boolean;
  openToCoFounders: boolean;
  prioritizeProfitability: boolean;
}

export interface MarketAnalysis {
  knownCompetitors: string[];
  competitorStrength: number;
  marketTiming: 'early' | 'growing' | 'mature' | 'declining';
  marketType: 'winner_takes_all' | 'fragmented' | 'oligopoly';
  regulatoryComplexity: number;
  estimatedTAM?: number;
  estimatedSAM?: number;
  estimatedSOM?: number;
}

export interface DetailedInput {
  productDescription?: string;
  mainProblemSolved?: string;
  uniqueValueProp?: string;
  liveURL?: string;
  landingPageURL?: string;
  screenshots?: File[];
  pricingStructure?: string;
  repoURL?: string;
  repoZip?: File;
  pitchDeck?: File;
  businessPlan?: File;
  financialProjections?: File;
}

export interface WizardData {
  tier: DataSharingTier;
  projectBasics: Partial<ProjectBasics>;
  personalSituation: Partial<PersonalSituation>;
  goals: Partial<Goals>;
  marketAnalysis: Partial<MarketAnalysis>;
  detailedInput: Partial<DetailedInput>;
  completedSteps: number[];
}

// ==================== ROUTE RESULT ====================
export type RecommendedRoute = 'bootstrap' | 'investor' | 'hybrid';

export interface RouteScores {
  bootstrap: number;
  investor: number;
  hybrid: number;
}

export interface RouteReason {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  explanation: string;
  score: number;
}

export interface ActionPhase {
  title: string;
  duration: string;
  tasks: ActionTask[];
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  timePerWeek: {
    min: number;
    max: number;
  };
  milestones: string[];
  resources: Resource[];
}

export interface ActionTask {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedHours: number;
  tools?: string[];
  tips?: string[];
  completed?: boolean;
}

export interface Resource {
  name: string;
  type: 'tool' | 'course' | 'template' | 'community' | 'service';
  url?: string;
  cost: 'free' | 'freemium' | 'paid';
  description: string;
}

export interface ActionPlan {
  route: RecommendedRoute;
  phases: ActionPhase[];
  totalBudget: {
    min: number;
    max: number;
    currency: string;
  };
  totalDuration: string;
  criticalPath: string[];
  riskFactors: string[];
  successMetrics: string[];
}

export interface RouteResult {
  recommendation: RecommendedRoute;
  scores: RouteScores;
  confidence: number;
  reasons: RouteReason[];
  actionPlan: ActionPlan;
  alternativeConsiderations: string[];
  warnings: string[];
}

// ==================== VALUATION ====================
export type ValuationMethod =
  | 'berkus'
  | 'scorecard'
  | 'vc_method'
  | 'comparables'
  | 'dcf'
  | 'cost_to_duplicate';

export interface BerkusFactors {
  soundIdea: number;
  prototype: number;
  qualityTeam: number;
  strategicRelations: number;
  productRollout: number;
}

export interface ScorecardFactors {
  teamStrength: { weight: number; score: number };
  marketSize: { weight: number; score: number };
  productTech: { weight: number; score: number };
  competition: { weight: number; score: number };
  marketingSales: { weight: number; score: number };
  needForFunding: { weight: number; score: number };
  other: { weight: number; score: number };
}

export interface VCMethodInput {
  expectedExitValue: number;
  yearsToExit: number;
  expectedReturn: number;
  investmentAmount: number;
  dilutionAssumption?: number;
}

export interface ComparableCompany {
  name: string;
  valuation: number;
  metric: number;
  metricType: string;
  fundingStage: string;
  region: string;
  date: string;
}

export interface ComparablesInput {
  comparableCompanies: ComparableCompany[];
  selectedMetric: 'revenue' | 'users' | 'arr' | 'gmv';
  adjustmentFactor: number;
}

export interface DCFInput {
  projectedCashFlows: number[];
  discountRate: number;
  terminalGrowthRate: number;
  years: number;
}

export interface ValuationMethodResult {
  method: ValuationMethod;
  value: number;
  confidence: number;
  inputs: Record<string, unknown>;
  breakdown?: Record<string, number>;
  notes: string[];
}

export interface ImprovementTip {
  id: string;
  title: string;
  description: string;
  potentialIncrease: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
  applicableMethods: ValuationMethod[];
}

export interface ValuationResult {
  methods: ValuationMethodResult[];
  aggregatedValue: {
    low: number;
    mid: number;
    high: number;
  };
  overallConfidence: number;
  confidenceFactors: string[];
  improvementTips: ImprovementTip[];
  comparisons: {
    industryAverage?: number;
    stageAverage?: number;
    regionAverage?: number;
  };
  disclaimer: string;
}

// ==================== UI STATE ====================
export interface UIState {
  currentPage: string;
  wizardStep: number;
  valuationStep: number;
  activeHelper: string | null;
  sidebarOpen: boolean;
  toasts: Toast[];
  modals: Modal[];
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface Modal {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

// ==================== HELPER TYPES ====================
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface StepConfig {
  id: string;
  title: string;
  description?: string;
  requiredTier?: DataSharingTier;
  isOptional?: boolean;
}

export interface ConfidenceExplanation {
  factor: string;
  impact: number;
  description: string;
}

// ==================== ANALYSIS HISTORY ====================
export interface SavedAnalysis {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  projectId: string | null; // null means "Ungrouped"

  // Snapshot of analysis data
  tier: DataSharingTier;
  wizardData: WizardData;
  routeResult: RouteResult | null;
  valuationResults: {
    methodResults: ValuationMethodResult[];
    finalResult: ValuationResult | null;
  };

  // Progress tracking
  completedTasks: string[];
  taskTimeTracking: TaskTimeEntry[];

  // Metadata
  tags: string[];
  notes: string;
  isFavorite: boolean;
}

export interface TaskTimeEntry {
  taskId: string;
  startedAt: string;
  completedAt: string | null;
  estimatedHours: number;
  actualHours: number | null;
}

// ==================== PROJECT/FOLDER ====================
export interface Project {
  id: string;
  name: string;
  description: string;
  color: string; // hex color for visual identification
  icon: string; // lucide icon name
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isExpanded: boolean;
}

export const DEFAULT_PROJECT_COLORS = [
  '#1e3a5f', // navy
  '#d4af37', // gold
  '#7c9a8a', // sage
  '#e74c3c', // red
  '#9b59b6', // purple
  '#3498db', // blue
  '#1abc9c', // teal
  '#f39c12', // orange
];

// ==================== PROGRESS TRACKING ====================
export interface TaskProgressSummary {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  estimatedTotalHours: number;
  actualTotalHours: number;
  remainingHours: number;
}

export interface PhaseProgressSummary extends TaskProgressSummary {
  phaseName: string;
  phaseIndex: number;
}

export interface MilestoneStatus {
  milestone: string;
  phaseIndex: number;
  isComplete: boolean;
  tasksRequired: string[];
  tasksCompleted: string[];
}

// ==================== COMPARISON ====================
export interface ComparisonMetric {
  label: string;
  key: string;
  values: Array<{
    analysisId: string;
    analysisName: string;
    value: number | string;
    displayValue: string;
  }>;
  unit?: string;
  betterDirection?: 'higher' | 'lower' | 'neutral';
}

export const COMPARISON_COLORS = [
  '#1e3a5f', // navy
  '#d4af37', // gold
  '#7c9a8a', // sage
  '#e74c3c', // red
];
