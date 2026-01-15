import type { StateCreator } from 'zustand';
import type {
  ValuationMethod,
  BerkusFactors,
  ScorecardFactors,
  VCMethodInput,
  ComparablesInput,
  DCFInput,
  ValuationResult,
  ValuationMethodResult,
} from '@/types';

export interface ValuationSlice {
  activeMethod: ValuationMethod;
  berkusFactors: BerkusFactors;
  scorecardFactors: ScorecardFactors;
  vcMethodInput: VCMethodInput;
  comparablesInput: ComparablesInput;
  dcfInput: DCFInput;
  methodResults: ValuationMethodResult[];
  finalResult: ValuationResult | null;

  setActiveMethod: (method: ValuationMethod) => void;
  setBerkusFactors: (factors: Partial<BerkusFactors>) => void;
  setScorecardFactors: (factors: Partial<ScorecardFactors>) => void;
  setVCMethodInput: (input: Partial<VCMethodInput>) => void;
  setComparablesInput: (input: Partial<ComparablesInput>) => void;
  setDCFInput: (input: Partial<DCFInput>) => void;
  addMethodResult: (result: ValuationMethodResult) => void;
  setFinalResult: (result: ValuationResult) => void;
  resetValuation: () => void;
  getMethodResult: (method: ValuationMethod) => ValuationMethodResult | undefined;
}

const initialBerkusFactors: BerkusFactors = {
  soundIdea: 50,
  prototype: 50,
  qualityTeam: 50,
  strategicRelations: 50,
  productRollout: 50,
};

const initialScorecardFactors: ScorecardFactors = {
  teamStrength: { weight: 30, score: 50 },
  marketSize: { weight: 25, score: 50 },
  productTech: { weight: 15, score: 50 },
  competition: { weight: 10, score: 50 },
  marketingSales: { weight: 10, score: 50 },
  needForFunding: { weight: 5, score: 50 },
  other: { weight: 5, score: 50 },
};

const initialVCMethodInput: VCMethodInput = {
  expectedExitValue: 10000000,
  yearsToExit: 5,
  expectedReturn: 10,
  investmentAmount: 500000,
  dilutionAssumption: 20,
};

const initialComparablesInput: ComparablesInput = {
  comparableCompanies: [],
  selectedMetric: 'revenue',
  adjustmentFactor: 1,
};

const initialDCFInput: DCFInput = {
  projectedCashFlows: [100000, 150000, 200000, 250000, 300000],
  discountRate: 25,
  terminalGrowthRate: 3,
  years: 5,
};

export const createValuationSlice: StateCreator<ValuationSlice> = (set, get) => ({
  activeMethod: 'berkus',
  berkusFactors: initialBerkusFactors,
  scorecardFactors: initialScorecardFactors,
  vcMethodInput: initialVCMethodInput,
  comparablesInput: initialComparablesInput,
  dcfInput: initialDCFInput,
  methodResults: [],
  finalResult: null,

  setActiveMethod: (method) => set({ activeMethod: method }),

  setBerkusFactors: (factors) =>
    set((state) => ({
      berkusFactors: { ...state.berkusFactors, ...factors },
    })),

  setScorecardFactors: (factors) =>
    set((state) => ({
      scorecardFactors: { ...state.scorecardFactors, ...factors },
    })),

  setVCMethodInput: (input) =>
    set((state) => ({
      vcMethodInput: { ...state.vcMethodInput, ...input },
    })),

  setComparablesInput: (input) =>
    set((state) => ({
      comparablesInput: { ...state.comparablesInput, ...input },
    })),

  setDCFInput: (input) =>
    set((state) => ({
      dcfInput: { ...state.dcfInput, ...input },
    })),

  addMethodResult: (result) =>
    set((state) => ({
      methodResults: [
        ...state.methodResults.filter((r) => r.method !== result.method),
        result,
      ],
    })),

  setFinalResult: (result) => set({ finalResult: result }),

  resetValuation: () =>
    set({
      berkusFactors: initialBerkusFactors,
      scorecardFactors: initialScorecardFactors,
      vcMethodInput: initialVCMethodInput,
      comparablesInput: initialComparablesInput,
      dcfInput: initialDCFInput,
      methodResults: [],
      finalResult: null,
    }),

  getMethodResult: (method) => {
    const { methodResults } = get();
    return methodResults.find((r) => r.method === method);
  },
});
