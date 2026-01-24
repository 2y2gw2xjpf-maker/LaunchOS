import type { StateCreator } from 'zustand';
import type {
  WizardData,
  ProjectBasics,
  PersonalSituation,
  Goals,
  MarketAnalysis,
  DetailedInput,
} from '@/types';

export interface WizardSlice {
  wizardData: WizardData;
  currentStep: number;
  totalSteps: number;

  setWizardData: (data: Partial<WizardData>) => void;
  setProjectBasics: (data: Partial<ProjectBasics>) => void;
  setPersonalSituation: (data: Partial<PersonalSituation>) => void;
  setGoals: (data: Partial<Goals>) => void;
  setMarketAnalysis: (data: Partial<MarketAnalysis>) => void;
  setDetailedInput: (data: Partial<DetailedInput>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeStep: (stepIndex: number) => void;
  resetWizard: () => void;
  getStepCompletion: () => number;
  isStepComplete: (stepIndex: number) => boolean;
}

const initialWizardData: WizardData = {
  tier: 'minimal',
  projectBasics: {},
  personalSituation: {},
  goals: {},
  marketAnalysis: {},
  detailedInput: {},
  completedSteps: [],
};

export const createWizardSlice: StateCreator<WizardSlice> = (set, get) => ({
  wizardData: initialWizardData,
  currentStep: 0,
  totalSteps: 5,

  setWizardData: (data) =>
    set((state) => ({
      wizardData: { ...state.wizardData, ...data },
    })),

  setProjectBasics: (data) =>
    set((state) => ({
      wizardData: {
        ...state.wizardData,
        projectBasics: { ...state.wizardData.projectBasics, ...data },
      },
    })),

  setPersonalSituation: (data) =>
    set((state) => ({
      wizardData: {
        ...state.wizardData,
        personalSituation: { ...state.wizardData.personalSituation, ...data },
      },
    })),

  setGoals: (data) =>
    set((state) => ({
      wizardData: {
        ...state.wizardData,
        goals: { ...state.wizardData.goals, ...data },
      },
    })),

  setMarketAnalysis: (data) =>
    set((state) => ({
      wizardData: {
        ...state.wizardData,
        marketAnalysis: { ...state.wizardData.marketAnalysis, ...data },
      },
    })),

  setDetailedInput: (data) =>
    set((state) => ({
      wizardData: {
        ...state.wizardData,
        detailedInput: { ...state.wizardData.detailedInput, ...data },
      },
    })),

  setCurrentStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),

  completeStep: (stepIndex) =>
    set((state) => ({
      wizardData: {
        ...state.wizardData,
        completedSteps: state.wizardData.completedSteps.includes(stepIndex)
          ? state.wizardData.completedSteps
          : [...state.wizardData.completedSteps, stepIndex],
      },
    })),

  resetWizard: () =>
    set({
      wizardData: initialWizardData,
      currentStep: 0,
    }),

  getStepCompletion: () => {
    const { wizardData, totalSteps } = get();
    return (wizardData.completedSteps.length / totalSteps) * 100;
  },

  isStepComplete: (stepIndex) => {
    const { wizardData } = get();
    return wizardData.completedSteps.includes(stepIndex);
  },
});
