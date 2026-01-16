/**
 * LaunchOS Hooks Index
 * Zentrale Exports für alle Custom Hooks
 */

export { useChat } from './useChat';
export type { ChatContext, UseChatOptions, UseChatReturn } from './useChat';

export { useChatStream } from './useChatStream';
export type {
  ChatMessage,
  UserContext,
  JourneyContext,
  ToolResult,
  UseChatStreamOptions,
  UseChatStreamReturn
} from './useChatStream';

export { useDeliverableChat } from './useDeliverableChat';
export type { ChatMessage as DeliverableChatMessage, DeliverableState } from './useDeliverableChat';

export { useFileUpload } from './useFileUpload';
export type { ProcessedFile, UseFileUploadReturn } from './useFileUpload';

export { useVoiceRecording } from './useVoiceRecording';
export type { VoiceRecording, UseVoiceRecordingReturn } from './useVoiceRecording';

export { useChatSessions } from './useChatSessions';
export type { ChatSession, UseChatSessionsReturn } from './useChatSessions';

export { useAnalyses, useProjects, useLaunchOSData, useSubscriptionLimits } from './useSupabaseData';
export { useOnlineStatus } from './useOnlineStatus';

// Ventures
export { useVentures } from './useVentures';
export type { Venture, UseVenturesReturn } from './useVentures';

// Deliverables
export { useDeliverables, DELIVERABLE_LABELS, DELIVERABLE_ICONS } from './useDeliverables';
export type { Deliverable, DeliverableType, UseDeliverablesReturn } from './useDeliverables';

// Programs
export { useProgram } from './useProgram';
export type {
  ProgramStep,
  ProgramTemplate,
  StepResult,
  ProgramExecution,
  UseProgramReturn
} from './useProgram';
