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
  ventureId: string | null; // Link to venture (optional)

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

// ==================== TASK ASSISTANCE SYSTEM ====================

// Info Field wrapper for each data field with metadata
export interface InfoField<T> {
  value: T | null;
  status: 'missing' | 'partial' | 'complete' | 'verified';
  confidence: number; // 0-100
  source: 'user_input' | 'ai_generated' | 'research' | 'calculated';
  lastUpdated: string | null;
  notes?: string;
}

// Market Size data
export interface MarketSize {
  value: number;
  currency: 'EUR' | 'USD';
  year: number;
  source: string;
  methodology: string;
}

// Competitor analysis
export interface CompetitorInfo {
  name: string;
  website?: string;
  description: string;
  funding?: number;
  strengths: string[];
  weaknesses: string[];
  differentiator: string;
}

// Team member
export interface TeamMember {
  name: string;
  role: string;
  linkedin?: string;
  background: string;
  relevantExperience: string[];
}

// Revenue model types
export type RevenueModelType = 'subscription' | 'transaction' | 'license' | 'advertising' | 'freemium' | 'marketplace' | 'other';

export interface RevenueModel {
  type: RevenueModelType;
  description: string;
  recurringPercentage: number;
}

// Pricing strategy
export interface PricingStrategy {
  model: 'fixed' | 'tiered' | 'usage_based' | 'freemium' | 'enterprise';
  averagePrice: number;
  currency: 'EUR' | 'USD';
  tiers?: { name: string; price: number; features: string[] }[];
}

// Unit economics
export interface UnitEconomics {
  cac: number; // Customer Acquisition Cost
  ltv: number; // Lifetime Value
  paybackPeriod: number; // Months
  grossMargin: number; // Percentage
  churnRate?: number; // Monthly percentage
}

// Growth metrics
export interface GrowthMetrics {
  monthlyGrowthRate: number;
  yearOverYearGrowth?: number;
  retentionRate?: number;
}

// Milestone
export interface StartupMilestone {
  title: string;
  date: string;
  description: string;
  category: 'product' | 'funding' | 'team' | 'traction' | 'partnership';
}

// Use of funds
export interface UseOfFunds {
  category: string;
  percentage: number;
  amount: number;
  description: string;
}

// Previous funding
export interface PreviousFunding {
  round: string;
  amount: number;
  date: string;
  investors: string[];
}

// Startup stage for task system
export type StartupStage = 'idea' | 'mvp' | 'pre_seed' | 'seed' | 'series_a' | 'series_b_plus';

// Investor types
export type InvestorType = 'angel' | 'micro_vc' | 'vc' | 'corporate_vc' | 'family_office' | 'accelerator' | 'government_grant';

// Funding round types
export type FundingRoundType = 'pre_seed' | 'seed' | 'series_a' | 'series_b' | 'bridge';

// Full Project Context for Task Assistance
export interface ProjectContext {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;

  // Core Information
  core: {
    problemStatement: InfoField<string>;
    solution: InfoField<string>;
    targetCustomer: InfoField<string>;
    uniqueValueProposition: InfoField<string>;
  };

  // Market Information
  market: {
    tam: InfoField<MarketSize>;
    sam: InfoField<MarketSize>;
    som: InfoField<MarketSize>;
    marketTrends: InfoField<string[]>;
    competitors: InfoField<CompetitorInfo[]>;
  };

  // Business Model
  business: {
    revenueModel: InfoField<RevenueModel>;
    pricingStrategy: InfoField<PricingStrategy>;
    unitEconomics: InfoField<UnitEconomics>;
    salesStrategy: InfoField<string>;
  };

  // Traction & Metrics
  traction: {
    currentStage: InfoField<StartupStage>;
    users: InfoField<number>;
    revenue: InfoField<number>;
    growth: InfoField<GrowthMetrics>;
    keyMilestones: InfoField<StartupMilestone[]>;
  };

  // Team
  team: {
    founders: InfoField<TeamMember[]>;
    employees: InfoField<number>;
    advisors: InfoField<TeamMember[]>;
    keyHires: InfoField<string[]>;
  };

  // Funding
  funding: {
    currentRound: InfoField<FundingRoundType>;
    targetAmount: InfoField<number>;
    useOfFunds: InfoField<UseOfFunds[]>;
    previousFunding: InfoField<PreviousFunding[]>;
    runway: InfoField<number>; // Months
  };

  // Preferences (for Investor Matching)
  preferences: {
    investorTypes: InfoField<InvestorType[]>;
    geographicFocus: InfoField<string[]>;
    industryFocus: InfoField<string[]>;
    dealBreakers: InfoField<string[]>;
  };
}

// ==================== TASK SYSTEM ====================

export type TaskHelpType = 'generate' | 'research' | 'guide' | 'calculate' | 'none';

export interface TaskRequirement {
  id: string;
  label: string;
  description: string;
  contextPath: string; // e.g., 'core.problemStatement', 'market.tam'
  importance: 'critical' | 'important' | 'nice_to_have';
  helperConfig?: {
    type: 'wizard' | 'calculator' | 'research' | 'template';
    componentId: string;
  };
}

export interface TaskAssistance {
  canHelp: boolean;
  helpType: TaskHelpType;
  requirements: TaskRequirement[];
  minimumRequirements: string[]; // Requirement IDs
  qualityGate: {
    minConfidenceToStart: number;
    minConfidenceForDraft: number;
    minConfidenceForFinal: number;
  };
  output: {
    type: 'document' | 'list' | 'analysis' | 'calculation' | 'guide';
    format: string;
  };
}

export interface SuggestedTool {
  name: string;
  description: string;
  cost: number;
  alternative?: string;
  url: string;
}

export interface AssistableTask extends ActionTask {
  assistance: TaskAssistance;
  dependencies: string[];
  tags: string[];
  suggestedTools: SuggestedTool[];
}

// ==================== TASK EXECUTION ====================

export type TaskExecutionPhase =
  | 'info_check'
  | 'info_gathering'
  | 'generating'
  | 'reviewing'
  | 'refining'
  | 'completed';

export interface RequirementStatus {
  requirementId: string;
  status: 'missing' | 'partial' | 'complete';
  currentValue: unknown;
  confidence: number;
  message: string;
}

export interface Assumption {
  id: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  howToVerify: string;
}

export interface Source {
  type: 'user_input' | 'web_research' | 'database' | 'calculation';
  reference: string;
  reliability: number; // 0-100
}

export interface TaskExecutionState {
  taskId: string;
  phase: TaskExecutionPhase;

  infoCheck: {
    requirements: RequirementStatus[];
    overallReadiness: number;
    canProceed: boolean;
    canProceedWithWarnings: boolean;
    blockers: string[];
    warnings: string[];
  };

  output: {
    content: unknown;
    confidence: number;
    assumptions: Assumption[];
    sourcesUsed: Source[];
  };

  review: {
    userFeedback: string[];
    iterations: number;
    approved: boolean;
  };
}

// ==================== INVESTOR TYPES ====================

export interface PortfolioCompany {
  name: string;
  sector: string;
  stage: FundingRoundType;
  year: number;
}

export interface Investor {
  id: string;
  name: string;
  type: InvestorType;
  website: string;

  criteria: {
    stages: FundingRoundType[];
    ticketSize: { min: number; max: number };
    sectors: string[];
    geographies: string[];
  };

  portfolio: {
    totalInvestments: number;
    recentInvestments: PortfolioCompany[];
    notableExits: string[];
  };

  contact: {
    preferredMethod: 'warm_intro' | 'cold_email' | 'application' | 'event';
    applicationUrl?: string;
    keyPartners: string[];
  };

  matchScore?: {
    overall: number;
    breakdown: {
      stageMatch: number;
      sectorMatch: number;
      ticketMatch: number;
      geographyMatch: number;
      activityScore: number;
    };
    reasoning: string;
  };
}

// ==================== PITCH DECK TYPES ====================

export interface PitchDeckSlide {
  number: number;
  title: string;
  content: string;
  speakerNotes: string;
  dataConfidence: number;
  assumptions?: string[];
}

export interface PitchDeckResult {
  slides: PitchDeckSlide[];
  overallConfidence: number;
  assumptions: Assumption[];
  missingForBetterDeck: string[];
}

// ==================== INVESTOR LIST TYPES ====================

export interface InvestorSearchParams {
  stage: string;
  sector: string;
  fundingTarget: number;
  geography: string[];
  investorTypes: string[];
  uniqueAngle?: string;
}

export interface InvestorListResult {
  investors: Investor[];
  confidence: number;
  assumptions: Assumption[];
  searchMethodology: string;
  limitations: string[];
}

// ==================== JOURNEY SYSTEM ====================

export type JourneyPhase = 'foundation' | 'legal' | 'branding' | 'product' | 'launch' | 'funding' | 'growth';

export type JourneyCategory = 'legal' | 'finance' | 'product' | 'marketing' | 'operations' | 'funding' | 'compliance';

export type StepStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'not_applicable';

export type ResourceType = 'official' | 'guide' | 'template' | 'tool' | 'service';

export type JourneyHelpType = 'chat' | 'template' | 'generate' | 'guide';

export type CompanyType = 'gmbh' | 'ug' | 'einzelunternehmen' | 'gbr' | 'ag' | 'not_yet_founded';

export type FundingPath = 'bootstrap' | 'investor' | 'grant' | 'undecided';

export type StartupStageJourney = 'idea' | 'building' | 'mvp' | 'launched' | 'scaling';

export type DeliverableType =
  | 'pitch_deck'
  | 'business_plan'
  | 'financial_model'
  | 'investor_list'
  | 'valuation_report'
  | 'legal_docs'
  | 'data_room'
  | 'outreach_emails';

// Journey Step (System-definiert)
export interface JourneyStep {
  id: string;
  phase: JourneyPhase;
  category: JourneyCategory;
  title: string;
  description: string;
  requires: string[];
  canHelp: boolean;
  helpType: JourneyHelpType | null;
  helpAction: string | null;
  estimatedTime: string | null;
  estimatedCost: string | null;
  applicableWhen: {
    stage?: StartupStageJourney[];
    funding_path?: FundingPath[];
    company_type?: CompanyType[];
  };
  sortOrder: number;
}

// Resource für einen Step
export interface JourneyResource {
  id: string;
  stepId: string;
  type: ResourceType;
  title: string;
  url: string;
  description: string | null;
  isFree: boolean;
  sortOrder: number;
}

// User Progress für einen Step
export interface UserJourneyProgress {
  id: string;
  userId: string;
  stepId: string;
  status: StepStatus;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Extended Step mit Resources und Progress
export interface JourneyStepWithDetails extends JourneyStep {
  resources: JourneyResource[];
  progress: UserJourneyProgress | null;
}

// User Journey Profile (Erweiterung von profiles)
export interface UserJourneyProfile {
  id: string;
  userId: string;
  industry: string | null;
  description: string | null;
  companyType: CompanyType;
  fundingPath: FundingPath;
  stage: StartupStageJourney;
  monthlyRevenue: number | null;
  growthRate: number | null;
  teamSize: number | null;
  onboardingCompleted: boolean;
}

// Deliverable
export interface Deliverable {
  id: string;
  userId: string;
  type: DeliverableType;
  title: string;
  content: Record<string, unknown> | null;
  fileUrl: string | null;
  fileType: string | null;
  version: number;
  parentId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Deliverable Version
export interface DeliverableVersion {
  id: string;
  deliverableId: string;
  version: number;
  content: Record<string, unknown> | null;
  fileUrl: string | null;
  changeDescription: string | null;
  createdAt: string;
}

// Valuation (DB-Modell)
export interface ValuationRecord {
  id: string;
  userId: string;
  analysisId: string | null;
  valueLow: number | null;
  valueMid: number | null;
  valueHigh: number | null;
  confidenceScore: number | null;
  confidenceFactors: Record<string, number> | null;
  methodsUsed: ValuationMethodResult[] | null;
  inputs: Record<string, unknown> | null;
  improvementSuggestions: string[] | null;
  createdAt: string;
}

// Chat Session
export interface ChatSession {
  id: string;
  userId: string;
  title: string | null;
  context: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Chat Message
export interface ChatMessage {
  id: string;
  userId: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ==================== CONFIDENCE SCORING ====================

export interface ConfidenceFactors {
  dataCompleteness: number;    // 0-25
  dataQuality: number;         // 0-25
  methodApplicability: number; // 0-25
  marketData: number;          // 0-25
}

export interface ConfidenceResult {
  score: number;
  factors: ConfidenceFactors;
  explanations: string[];
}

// ==================== QUICK ACTIONS ====================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'translate_en', label: 'Auf Englisch', icon: '🌐', prompt: 'Übersetze ins Englische.' },
  { id: 'translate_de', label: 'Auf Deutsch', icon: '🇩🇪', prompt: 'Übersetze ins Deutsche.' },
  { id: 'shorten', label: 'Kürzer', icon: '✂️', prompt: 'Kürze um 30%. Behalte Wichtiges.' },
  { id: 'expand', label: 'Mehr Details', icon: '📝', prompt: 'Mehr Details und Beispiele.' },
  { id: 'executive_summary', label: 'Exec Summary', icon: '📋', prompt: 'Max 1 Seite Summary.' },
  { id: 'simplify', label: 'Vereinfachen', icon: '💡', prompt: 'Einfachere Sprache.' },
  { id: 'formal', label: 'Formeller', icon: '👔', prompt: 'Professionellerer Ton.' },
  { id: 'casual', label: 'Lockerer', icon: '😊', prompt: 'Persönlicherer Ton.' }
];

// ==================== JOURNEY PHASE CONFIG ====================

export interface JourneyPhaseConfig {
  id: JourneyPhase;
  title: string;
  description: string;
  color: string;
  icon: string;
}

export const JOURNEY_PHASES: JourneyPhaseConfig[] = [
  { id: 'foundation', title: 'Grundlagen', description: 'Rechtsform, Businessplan, Finanzen', color: '#9333ea', icon: 'Foundation' },
  { id: 'legal', title: 'Rechtliches', description: 'Notar, Handelsregister, Steuern', color: '#ec4899', icon: 'Scale' },
  { id: 'branding', title: 'Marke', description: 'Name, Domain, Markenanmeldung', color: '#f59e0b', icon: 'Palette' },
  { id: 'product', title: 'Produkt', description: 'MVP, Entwicklung, Launch', color: '#10b981', icon: 'Package' },
  { id: 'launch', title: 'Launch', description: 'Beta-Tester, erste Kunden', color: '#3b82f6', icon: 'Rocket' },
  { id: 'funding', title: 'Finanzierung', description: 'Investoren, Fördermittel', color: '#8b5cf6', icon: 'Banknote' },
  { id: 'growth', title: 'Wachstum', description: 'Skalierung, Profitabilität', color: '#06b6d4', icon: 'TrendingUp' },
];
