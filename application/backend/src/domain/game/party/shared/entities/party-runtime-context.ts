import type { PartyActionId } from './party-action';
import type { PartyStageId } from './party-stage';

export enum PartyRuntimePhase {
  LOBBY = 'lobby',
  STAGE = 'stage',
  RESULT = 'result',
  ENDED = 'ended',
}

const PARTY_RUNTIME_ACTION_SUBMISSION_STATUS = {
  ACKNOWLEDGED: 'acknowledged',
} as const;

type PartyRuntimeActionSubmissionStatus =
  (typeof PARTY_RUNTIME_ACTION_SUBMISSION_STATUS)[keyof typeof PARTY_RUNTIME_ACTION_SUBMISSION_STATUS];

interface PartyRuntimeBaseLifecycleContext {
  readonly stageEndsAtEpochMs: number | null;
  readonly stageRemainingDurationMs: number | null;
  readonly stageTimeLimitSeconds: number | null;
  readonly totalStages: number;
}

interface PartyRuntimeLobbyLifecycleContext extends PartyRuntimeBaseLifecycleContext {
  readonly phase: PartyRuntimePhase.LOBBY;
  readonly stageId: null;
  readonly stagePosition: null;
}

interface PartyRuntimeStageLifecycleContext extends PartyRuntimeBaseLifecycleContext {
  readonly phase: PartyRuntimePhase.STAGE;
  readonly stageId: PartyStageId;
  readonly stagePosition: number;
}

interface PartyRuntimeResultLifecycleContext extends PartyRuntimeBaseLifecycleContext {
  readonly phase: PartyRuntimePhase.RESULT;
  readonly stageId: PartyStageId;
  readonly stagePosition: number;
}

interface PartyRuntimeEndedLifecycleContext extends PartyRuntimeBaseLifecycleContext {
  readonly phase: PartyRuntimePhase.ENDED;
  readonly stageId: PartyStageId | null;
  readonly stagePosition: number | null;
}

export type PartyRuntimeLifecycleContext =
  | PartyRuntimeLobbyLifecycleContext
  | PartyRuntimeStageLifecycleContext
  | PartyRuntimeResultLifecycleContext
  | PartyRuntimeEndedLifecycleContext;

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
  readonly actionSubmission: PartyRuntimeActionSubmissionContext | null;
  readonly current: PartyRuntimeCurrentStageContext | null;
}

interface PartyRuntimeCurrentResultContext {
  readonly actions: readonly PartyRuntimeResultActionContext[];
  readonly text: string;
}

interface PartyRuntimeResultContext {
  readonly current: PartyRuntimeCurrentResultContext | null;
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
