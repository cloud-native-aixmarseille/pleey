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

export interface PartyRuntimeLifecycleContext {
  readonly phase: PartyRuntimePhase;
  readonly stageId: PartyStageId | null;
  readonly stagePosition: number | null;
  readonly totalStages: number;
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
  readonly stageId: PartyStageId;
  readonly stagePosition: number;
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
  readonly stageId: PartyStageId;
  readonly stagePosition: number;
  readonly text: string;
}

interface PartyRuntimeResultContext {
  readonly current: PartyRuntimeCurrentResultContext | null;
  readonly currentPlayer: PartyRuntimeCurrentPlayerResultContext | null;
}

export interface PartyRuntimeContext {
  readonly lifecycle: PartyRuntimeLifecycleContext;
  readonly stage?: PartyRuntimeStageContext;
  readonly result?: PartyRuntimeResultContext;
}
