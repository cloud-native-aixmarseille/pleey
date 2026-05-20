import type { PartyActionId } from './party-action';
import type { StageId } from './party-stage';

export const PARTY_RUNTIME_PHASE = {
  LOBBY: 'lobby',
  STAGE: 'stage',
  RESULT: 'result',
  ENDED: 'ended',
} as const;

const PARTY_RUNTIME_ACTION_SUBMISSION_STATUS = {
  ACKNOWLEDGED: 'acknowledged',
} as const;

export type PartyRuntimePhase = (typeof PARTY_RUNTIME_PHASE)[keyof typeof PARTY_RUNTIME_PHASE];
type PartyRuntimeActionSubmissionStatus =
  (typeof PARTY_RUNTIME_ACTION_SUBMISSION_STATUS)[keyof typeof PARTY_RUNTIME_ACTION_SUBMISSION_STATUS];

interface PartyRuntimeBaseLifecycleContext {
  readonly stageEndsAtEpochMs: number | null;
  readonly stageRemainingDurationMs: number | null;
  readonly stageTimeLimitSeconds: number | null;
  readonly totalStages: number;
}

interface PartyRuntimeLobbyLifecycleContext extends PartyRuntimeBaseLifecycleContext {
  readonly phase: typeof PARTY_RUNTIME_PHASE.LOBBY;
  readonly stageId: null;
  readonly stagePosition: null;
}

interface PartyRuntimeStageLifecycleContext extends PartyRuntimeBaseLifecycleContext {
  readonly phase: typeof PARTY_RUNTIME_PHASE.STAGE;
  readonly stageId: StageId;
  readonly stagePosition: number;
}

interface PartyRuntimeResultLifecycleContext extends PartyRuntimeBaseLifecycleContext {
  readonly phase: typeof PARTY_RUNTIME_PHASE.RESULT;
  readonly stageId: StageId;
  readonly stagePosition: number;
}

interface PartyRuntimeEndedLifecycleContext extends PartyRuntimeBaseLifecycleContext {
  readonly phase: typeof PARTY_RUNTIME_PHASE.ENDED;
  readonly stageId: StageId | null;
  readonly stagePosition: number | null;
}

interface PartyRuntimeStageActionContext {
  readonly id: PartyActionId;
  readonly text: string;
}

interface PartyRuntimeResultActionContext extends PartyRuntimeStageActionContext {
  readonly actionCount: number;
  readonly actionPercent: number;
  readonly earnedPoints: number;
  readonly isCorrect: boolean;
}

interface PartyRuntimeCurrentStageContext {
  readonly actions: readonly PartyRuntimeStageActionContext[];
  readonly text: string;
}

interface PartyRuntimeCurrentPlayerActionSubmissionContext {
  readonly selectedActionId: PartyActionId;
  readonly status: PartyRuntimeActionSubmissionStatus;
}

interface PartyRuntimeCurrentPlayerResultContext {
  readonly earnedPoints: number;
  readonly isCorrect: boolean;
  readonly selectedActionId: PartyActionId;
}

interface PartyRuntimeActionSubmissionContext {
  readonly currentPlayer: PartyRuntimeCurrentPlayerActionSubmissionContext | null;
  readonly submittedPlayerCount: number;
  readonly totalEligiblePlayerCount: number;
}

interface PartyRuntimeStageContext {
  readonly actionSubmission: PartyRuntimeActionSubmissionContext;
  readonly current: PartyRuntimeCurrentStageContext;
}

interface PartyRuntimeCurrentResultContext {
  readonly actions: readonly PartyRuntimeResultActionContext[];
  readonly text: string;
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
  return context?.lifecycle.phase === PARTY_RUNTIME_PHASE.STAGE;
}

export function isResultPartyRuntimeContext(
  context: PartyRuntimeContext | null | undefined,
): context is PartyRuntimeResultPhaseContext {
  return context?.lifecycle.phase === PARTY_RUNTIME_PHASE.RESULT;
}

export function isEndedPartyRuntimeContext(
  context: PartyRuntimeContext | null | undefined,
): context is PartyRuntimeEndedContext {
  return context?.lifecycle.phase === PARTY_RUNTIME_PHASE.ENDED;
}
