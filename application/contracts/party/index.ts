import type { ParticipantId, UserId } from "../identity/index.ts";
import type { Permissions } from "../shared/primitives/index.ts";

export type PartyId = string & { readonly __identifierBrand: "PartyId" };
export type PartyPin = string & { readonly __identifierBrand: "PartyPin" };
export type PartyActionId = string & { readonly __identifierBrand: "PartyActionId" };
export type PartyStageId = string & { readonly __identifierBrand: "PartyStageId" };

export const PartyRole = { HOST: "HOST", PLAYER: "PLAYER" } as const;
export type PartyRole = (typeof PartyRole)[keyof typeof PartyRole];
export declare namespace PartyRole {
  type HOST = typeof PartyRole.HOST;
  type PLAYER = typeof PartyRole.PLAYER;
}

export const PartyStatus = { WAITING: "WAITING", ACTIVE: "ACTIVE", PAUSED: "PAUSED", ENDED: "ENDED" } as const;
export type PartyStatus = (typeof PartyStatus)[keyof typeof PartyStatus];

export const PartyRuntimePhase = {
  LOBBY: "lobby",
  STAGE: "stage",
  RESULT: "result",
  ENDED: "ended",
} as const;
export type PartyRuntimePhase = (typeof PartyRuntimePhase)[keyof typeof PartyRuntimePhase];
export declare namespace PartyRuntimePhase {
  type LOBBY = typeof PartyRuntimePhase.LOBBY;
  type STAGE = typeof PartyRuntimePhase.STAGE;
  type RESULT = typeof PartyRuntimePhase.RESULT;
  type ENDED = typeof PartyRuntimePhase.ENDED;
}

export const PartyPlayerKind = { USER: "user", PARTICIPANT: "participant" } as const;
export type PartyPlayerKind = (typeof PartyPlayerKind)[keyof typeof PartyPlayerKind];
export declare namespace PartyPlayerKind {
  type USER = typeof PartyPlayerKind.USER;
  type PARTICIPANT = typeof PartyPlayerKind.PARTICIPANT;
}

export interface AuthenticatedPartyPlayerIdentity {
  readonly kind: PartyPlayerKind.USER;
  readonly userId: UserId;
}

export interface DetachedPartyPlayerIdentity {
  readonly kind: PartyPlayerKind.PARTICIPANT;
  readonly participantId: ParticipantId;
}

export type PartyPlayerIdentity = AuthenticatedPartyPlayerIdentity | DetachedPartyPlayerIdentity;

export const PartyJoinReceiptStatus = { ACCEPTED: "accepted", REJECTED: "rejected" } as const;
export type PartyJoinReceiptStatus = (typeof PartyJoinReceiptStatus)[keyof typeof PartyJoinReceiptStatus];
export declare namespace PartyJoinReceiptStatus {
  type ACCEPTED = typeof PartyJoinReceiptStatus.ACCEPTED;
  type REJECTED = typeof PartyJoinReceiptStatus.REJECTED;
}

export const PARTY_PLAYER_ACTION_STATE_STATUS = { ACKNOWLEDGED: "acknowledged" } as const;
export type PartyPlayerActionStateStatus =
  (typeof PARTY_PLAYER_ACTION_STATE_STATUS)[keyof typeof PARTY_PLAYER_ACTION_STATE_STATUS];

export interface PartyRuntimeBaseLifecycleContext {
  readonly reading?: {
    readonly endsAtEpochMs: number | null;
    readonly remainingDurationMs: number;
  };
  readonly stageEndsAtEpochMs: number | null;
  readonly stageRemainingDurationMs: number | null;
  readonly stageTimeLimitSeconds: number | null;
  readonly totalStages: number;
}

export interface PartyRuntimeLobbyLifecycleContext extends PartyRuntimeBaseLifecycleContext {
  readonly phase: PartyRuntimePhase.LOBBY;
  readonly stageId: null;
  readonly stagePosition: null;
}

export interface PartyRuntimeStageLifecycleContext extends PartyRuntimeBaseLifecycleContext {
  readonly phase: PartyRuntimePhase.STAGE;
  readonly stageId: PartyStageId;
  readonly stagePosition: number;
}

export interface PartyRuntimeResultLifecycleContext extends PartyRuntimeBaseLifecycleContext {
  readonly phase: PartyRuntimePhase.RESULT;
  readonly stageId: PartyStageId;
  readonly stagePosition: number;
}

export interface PartyRuntimeEndedLifecycleContext extends PartyRuntimeBaseLifecycleContext {
  readonly phase: PartyRuntimePhase.ENDED;
  readonly stageId: PartyStageId | null;
  readonly stagePosition: number | null;
}

export type PartyRuntimeLifecycleContext =
  | PartyRuntimeLobbyLifecycleContext
  | PartyRuntimeStageLifecycleContext
  | PartyRuntimeResultLifecycleContext
  | PartyRuntimeEndedLifecycleContext;

export interface PartyRuntimeStageActionContext {
  readonly booleanValue?: boolean;
  readonly id: PartyActionId;
  readonly text: string;
}

export interface PartyRuntimeStageMediaContext {
  readonly id?: string;
  readonly expiresAt?: string;
  readonly partyId?: string;
  readonly mimeType: string;
  readonly uri: string;
}

export interface PartyRuntimeResultActionContext extends PartyRuntimeStageActionContext {
  readonly actionCount: number;
  readonly actionPercent: number;
  readonly earnedPoints: number;
  readonly isCorrect: boolean;
}

export interface PartyRuntimeCurrentStageContext {
  readonly actions: readonly PartyRuntimeStageActionContext[];
  readonly media?: PartyRuntimeStageMediaContext | null;
  readonly text: string;
}

export interface PartyRuntimeCurrentPlayerActionSubmissionContext {
  readonly selectedActionId: PartyActionId;
  readonly status: PartyPlayerActionStateStatus;
}

export interface PartyRuntimeCurrentPlayerResultContext {
  readonly earnedPoints: number;
  readonly isCorrect: boolean;
  readonly selectedActionId: PartyActionId;
}

export interface PartyRuntimeActionSubmissionContext {
  readonly currentPlayer: PartyRuntimeCurrentPlayerActionSubmissionContext | null;
  readonly submittedPlayerCount: number;
  readonly totalEligiblePlayerCount: number;
}

export interface PartyRuntimeCurrentResultContext {
  readonly actions: readonly PartyRuntimeResultActionContext[];
  readonly media?: PartyRuntimeStageMediaContext | null;
  readonly text: string;
}

export const HostPartyDisabledReason = {
  HOST_REQUIRED: "HOST_REQUIRED",
  PARTY_NOT_WAITING: "PARTY_NOT_WAITING",
  NO_PLAYERS: "NO_PLAYERS",
  NO_STAGES: "NO_STAGES",
  RUNTIME_UNAVAILABLE: "RUNTIME_UNAVAILABLE",
  RESULT_REQUIRED: "RESULT_REQUIRED",
  STAGE_REQUIRED: "STAGE_REQUIRED",
  PREVIOUS_STAGE_REQUIRED: "PREVIOUS_STAGE_REQUIRED",
  ACTIVE_PARTY_REQUIRED: "ACTIVE_PARTY_REQUIRED",
  PAUSED_PARTY_REQUIRED: "PAUSED_PARTY_REQUIRED",
  PARTY_ENDED: "PARTY_ENDED",
} as const;
export type HostPartyDisabledReason = (typeof HostPartyDisabledReason)[keyof typeof HostPartyDisabledReason];

export const HOST_PARTY_PERMISSION_ACTIONS = [
  "startParty",
  "advanceStage",
  "restartStage",
  "rewindStage",
  "rewindParty",
  "pauseParty",
  "resumeParty",
  "revealStageResult",
  "endParty",
] as const;
export type HostPartyPermissionAction = (typeof HOST_PARTY_PERMISSION_ACTIONS)[number];
export type HostPartyPermissions<Reason extends string = HostPartyDisabledReason> = Permissions<
  Record<HostPartyPermissionAction, Reason>
>;

export interface PartySettings {
  readonly questionReadingTimeSeconds: number;
  readonly allowJoiningAfterStart: boolean;
  readonly allowOptionChangeAfterVoting: boolean;
  readonly randomizeOptionOrder: boolean;
  readonly randomizeStageOrder: boolean;
}

export const DEFAULT_PARTY_SETTINGS = {
  questionReadingTimeSeconds: 3,
  allowJoiningAfterStart: false,
  allowOptionChangeAfterVoting: true,
  randomizeOptionOrder: false,
  randomizeStageOrder: false,
} as const satisfies PartySettings;

export const PARTY_READING_TIME_LIMITS = { min: 0, max: 30 } as const;

export const PARTY_SOCKET_INBOUND_EVENTS = {
  JOIN_PARTY: "join-party",
  LEAVE_PARTY: "leave-party",
  OBSERVE_PARTY: "observe-party",
  REJOIN_PARTY: "rejoin-party",
  REQUEST_PARTY_MEDIA: "request-party-media",
  SUBMIT_ACTION: "submit-action",
  START_PARTY: "start-party",
  ADVANCE_STAGE: "advance-stage",
  RESTART_STAGE: "restart-stage",
  REWIND_STAGE: "rewind-stage",
  REWIND_PARTY: "rewind-party",
  PAUSE_PARTY: "pause-party",
  RESUME_PARTY: "resume-party",
  REVEAL_STAGE_RESULT: "reveal-stage-result",
  END_PARTY: "end-party",
  KICK_PLAYER: "kick-player",
  STOP_OBSERVING_PARTY: "stop-observing-party",
} as const;

export const PARTY_SOCKET_OUTBOUND_EVENTS = {
  PARTY_RUNTIME_NOTICE: "party-runtime-notice",
  PARTY_SNAPSHOT: "party-snapshot",
  PARTY_UPDATED: "party-updated",
} as const;

export const PARTY_RUNTIME_NOTICE_KINDS = {
  RestartStage: "restartStage",
  RewindParty: "rewindParty",
  RewindStage: "rewindStage",
} as const;
export type PartyRuntimeNoticeKind = (typeof PARTY_RUNTIME_NOTICE_KINDS)[keyof typeof PARTY_RUNTIME_NOTICE_KINDS];
