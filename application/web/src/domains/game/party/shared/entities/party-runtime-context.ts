import type {
  PartyRuntimeActionSubmissionContext,
  PartyRuntimeCurrentPlayerResultContext,
  PartyRuntimeCurrentResultContext,
  PartyRuntimeCurrentStageContext,
  PartyRuntimeEndedLifecycleContext,
  PartyRuntimeLobbyLifecycleContext,
  PartyRuntimeResultLifecycleContext,
  PartyRuntimeStageLifecycleContext,
} from '@pleey/contracts/party';
import { PartyRuntimePhase } from '@pleey/contracts/party';

export { PartyRuntimePhase } from '@pleey/contracts/party';

interface PartyRuntimeStageContext {
  readonly actionSubmission: PartyRuntimeActionSubmissionContext;
  readonly current: PartyRuntimeCurrentStageContext;
}

interface PartyRuntimeResultContext {
  readonly current: PartyRuntimeCurrentResultContext;
  readonly currentPlayer: PartyRuntimeCurrentPlayerResultContext | null;
}

interface PartyRuntimeLobbyContext {
  readonly lifecycle: PartyRuntimeLobbyLifecycleContext;
  readonly result?: never;
  readonly stage?: never;
}

interface PartyRuntimeStagePhaseContext {
  readonly lifecycle: PartyRuntimeStageLifecycleContext;
  readonly result?: never;
  readonly stage: PartyRuntimeStageContext;
}

interface PartyRuntimeResultPhaseContext {
  readonly lifecycle: PartyRuntimeResultLifecycleContext;
  readonly result: PartyRuntimeResultContext;
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

export function isStagePartyRuntimeContext(
  context: PartyRuntimeContext | null | undefined,
): context is PartyRuntimeStagePhaseContext {
  return context?.lifecycle.phase === PartyRuntimePhase.STAGE;
}

export function isResultPartyRuntimeContext(
  context: PartyRuntimeContext | null | undefined,
): context is PartyRuntimeResultPhaseContext {
  return context?.lifecycle.phase === PartyRuntimePhase.RESULT;
}

export function isEndedPartyRuntimeContext(
  context: PartyRuntimeContext | null | undefined,
): context is PartyRuntimeEndedContext {
  return context?.lifecycle.phase === PartyRuntimePhase.ENDED;
}
