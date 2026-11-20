import type {
  PartyRuntimeActionSubmissionContext,
  PartyRuntimeCurrentPlayerResultContext,
  PartyRuntimeCurrentResultContext,
  PartyRuntimeCurrentStageContext,
  PartyRuntimeEndedLifecycleContext,
  PartyRuntimeLifecycleContext,
  PartyRuntimeResultLifecycleContext,
  PartyRuntimeStageLifecycleContext,
} from '@pleey/contracts/party';

export type { PartyRuntimeLifecycleContext } from '@pleey/contracts/party';
export { PartyRuntimePhase } from '@pleey/contracts/party';

interface PartyRuntimeStageContext {
  readonly actionSubmission: PartyRuntimeActionSubmissionContext | null;
  readonly current: PartyRuntimeCurrentStageContext | null;
}

interface PartyRuntimeResultContext {
  readonly current: PartyRuntimeCurrentResultContext | null;
  readonly currentPlayer: PartyRuntimeCurrentPlayerResultContext | null;
}

interface PartyRuntimeLobbyContext {
  readonly lifecycle: Extract<PartyRuntimeLifecycleContext, { phase: 'lobby' }>;
  readonly result?: never;
  readonly stage?: never;
}

interface PartyRuntimeStagePhaseContext {
  readonly lifecycle: PartyRuntimeStageLifecycleContext;
  readonly result?: never;
  readonly stage?: PartyRuntimeStageContext;
}

interface PartyRuntimeResultPhaseContext {
  readonly lifecycle: PartyRuntimeResultLifecycleContext;
  readonly result?: PartyRuntimeResultContext;
  readonly stage?: never;
}

interface PartyRuntimeEndedContext {
  readonly lifecycle: PartyRuntimeEndedLifecycleContext;
  readonly result?: PartyRuntimeResultContext;
  readonly stage?: never;
}

export type PartyRuntimeContext =
  | PartyRuntimeLobbyContext
  | PartyRuntimeStagePhaseContext
  | PartyRuntimeResultPhaseContext
  | PartyRuntimeEndedContext;
