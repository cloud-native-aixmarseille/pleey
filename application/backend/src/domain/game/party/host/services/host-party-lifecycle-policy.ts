import type { ActionPermission } from '../../../../shared/value-objects/action-permission';
import { PartyCommandNotAvailableError, PartyStagesNotAvailableError } from '../../../errors';
import { PartyStatus } from '../../enums/party-status.enum';
import {
  type PartyRuntimeContext,
  type PartyRuntimeLifecycleContext,
  PartyRuntimePhase,
} from '../../shared/entities/party-runtime-context';
import { DEFAULT_PARTY_SETTINGS } from '../../shared/entities/party-settings';
import { HostPartyDisabledReason, type HostPartyPermissions } from '../value-objects/host-party-permissions';

interface HostPartyLifecycleState {
  readonly questionReadingTimeSeconds?: number;
  readonly playerCount: number;
  readonly stageCount?: number;
  readonly status: PartyStatus;
  readonly runtime: PartyRuntimeContext | null;
}

interface HostPartyLifecycleTransitionResult {
  readonly runtime: PartyRuntimeContext | null;
  readonly status: PartyStatus;
}

interface HostPartyStageReference {
  readonly id: NonNullable<PartyRuntimeLifecycleContext['stageId']>;
  readonly stagePosition: number;
  readonly timeLimitSeconds: number;
}

export class HostPartyLifecyclePolicy {
  permissions(state: HostPartyLifecycleState): HostPartyPermissions {
    const lifecycle = state.runtime?.lifecycle;
    const playable = lifecycle?.phase === PartyRuntimePhase.STAGE || lifecycle?.phase === PartyRuntimePhase.RESULT;
    const running = state.status === PartyStatus.ACTIVE || state.status === PartyStatus.PAUSED;
    const runtime = this.decision(running && playable, HostPartyDisabledReason.RUNTIME_UNAVAILABLE);
    const stage = runtime.allowed
      ? this.decision(
          lifecycle?.stageId != null && lifecycle.stagePosition != null,
          HostPartyDisabledReason.STAGE_REQUIRED,
        )
      : runtime;
    return {
      startParty:
        state.status !== PartyStatus.WAITING
          ? this.decision(false, HostPartyDisabledReason.PARTY_NOT_WAITING)
          : !(state.playerCount > 0)
            ? this.decision(false, HostPartyDisabledReason.NO_PLAYERS)
            : this.decision((state.stageCount ?? 0) > 0, HostPartyDisabledReason.NO_STAGES),
      advanceStage: !stage.allowed
        ? stage
        : this.decision(lifecycle?.phase === PartyRuntimePhase.RESULT, HostPartyDisabledReason.RESULT_REQUIRED),
      restartStage: !stage.allowed
        ? stage
        : this.decision(lifecycle?.stageTimeLimitSeconds != null, HostPartyDisabledReason.STAGE_REQUIRED),
      rewindStage: !stage.allowed
        ? stage
        : this.decision((lifecycle?.stagePosition ?? 0) > 0, HostPartyDisabledReason.PREVIOUS_STAGE_REQUIRED),
      rewindParty: runtime,
      pauseParty: !runtime.allowed
        ? runtime
        : this.decision(state.status === PartyStatus.ACTIVE, HostPartyDisabledReason.ACTIVE_PARTY_REQUIRED),
      resumeParty: !runtime.allowed
        ? runtime
        : this.decision(state.status === PartyStatus.PAUSED, HostPartyDisabledReason.PAUSED_PARTY_REQUIRED),
      revealStageResult: !runtime.allowed
        ? runtime
        : this.decision(lifecycle?.phase === PartyRuntimePhase.STAGE, HostPartyDisabledReason.STAGE_REQUIRED),
      endParty: this.decision(state.status !== PartyStatus.ENDED, HostPartyDisabledReason.PARTY_ENDED),
    };
  }

  private decision(allowed: boolean, reason: HostPartyDisabledReason): ActionPermission<HostPartyDisabledReason> {
    return allowed ? { allowed: true, reason: null } : { allowed: false, reason };
  }

  private assertAction(state: HostPartyLifecycleState, action: keyof HostPartyPermissions): void {
    const decision = this.permissions(state)[action];
    if (!decision.allowed && decision.reason === HostPartyDisabledReason.NO_STAGES) {
      throw new PartyStagesNotAvailableError(this.createLifecycleErrorContext(state));
    }
    if (!decision.allowed)
      throw new PartyCommandNotAvailableError(
        this.createLifecycleErrorContext(state, { reason: decision.reason, action }),
      );
  }

  start(
    state: HostPartyLifecycleState,
    input: {
      readonly firstStage: HostPartyStageReference | null;
      readonly totalStages: number;
    },
  ): HostPartyLifecycleTransitionResult {
    this.assertAction({ ...state, stageCount: input.firstStage === null ? 0 : input.totalStages }, 'startParty');
    if (state.status !== PartyStatus.WAITING) {
      throw new PartyCommandNotAvailableError(
        this.createLifecycleErrorContext(state, {
          reason: 'partyMustBeWaitingToStart',
        }),
      );
    }

    if (input.totalStages <= 0 || input.firstStage === null) {
      throw new PartyStagesNotAvailableError({
        hasFirstStage: input.firstStage !== null,
        status: state.status,
        totalStages: input.totalStages,
      });
    }

    return {
      status: PartyStatus.ACTIVE,
      runtime: this.createStageRuntime(
        input.firstStage.id,
        input.firstStage.stagePosition,
        input.totalStages,
        input.firstStage.timeLimitSeconds,
        state,
      ),
    };
  }

  advanceStage(
    state: HostPartyLifecycleState,
    input: {
      readonly nextStage: HostPartyStageReference | null;
    },
  ): HostPartyLifecycleTransitionResult {
    this.assertAction(state, 'advanceStage');
    const lifecycle = this.requireLifecycle(state, PartyRuntimePhase.RESULT);

    if (lifecycle.stageId === null || lifecycle.stagePosition === null) {
      throw new PartyCommandNotAvailableError(
        this.createLifecycleErrorContext(state, {
          reason: 'currentStageReferenceMissing',
        }),
      );
    }

    if (input.nextStage === null) {
      return {
        status: PartyStatus.ENDED,
        runtime: this.createEndedRuntime(
          state.runtime,
          lifecycle.stageId,
          lifecycle.stagePosition,
          lifecycle.totalStages,
        ),
      };
    }

    return {
      status: state.status,
      runtime: this.createStageRuntime(
        input.nextStage.id,
        input.nextStage.stagePosition,
        lifecycle.totalStages,
        input.nextStage.timeLimitSeconds,
        state,
      ),
    };
  }

  restartStage(state: HostPartyLifecycleState): HostPartyLifecycleTransitionResult {
    this.assertAction(state, 'restartStage');
    const lifecycle = this.requireLifecycle(state, PartyRuntimePhase.STAGE, PartyRuntimePhase.RESULT);

    if (lifecycle.stageId === null || lifecycle.stagePosition === null || lifecycle.stageTimeLimitSeconds === null) {
      throw new PartyCommandNotAvailableError(
        this.createLifecycleErrorContext(state, {
          reason: 'stageTimerReferenceMissing',
        }),
      );
    }

    return {
      status: state.status,
      runtime: this.createStageRuntime(
        lifecycle.stageId,
        lifecycle.stagePosition,
        lifecycle.totalStages,
        lifecycle.stageTimeLimitSeconds,
        state,
      ),
    };
  }

  rewindStage(
    state: HostPartyLifecycleState,
    input: {
      readonly previousStage: HostPartyStageReference | null;
    },
  ): HostPartyLifecycleTransitionResult {
    this.assertAction(state, 'rewindStage');
    const lifecycle = this.requireLifecycle(state, PartyRuntimePhase.STAGE, PartyRuntimePhase.RESULT);

    if (lifecycle.stageId === null || lifecycle.stagePosition === null || input.previousStage === null) {
      throw new PartyCommandNotAvailableError(
        this.createLifecycleErrorContext(state, {
          hasPreviousStage: input.previousStage !== null,
          reason: 'previousStageUnavailable',
        }),
      );
    }

    return {
      status: state.status,
      runtime: this.createStageRuntime(
        input.previousStage.id,
        input.previousStage.stagePosition,
        lifecycle.totalStages,
        input.previousStage.timeLimitSeconds,
        state,
      ),
    };
  }

  rewindParty(state: HostPartyLifecycleState): HostPartyLifecycleTransitionResult {
    this.assertAction(state, 'rewindParty');
    const lifecycle = this.requireLifecycle(state, PartyRuntimePhase.STAGE, PartyRuntimePhase.RESULT);

    return {
      status: PartyStatus.WAITING,
      runtime: {
        lifecycle: {
          phase: PartyRuntimePhase.LOBBY,
          stageEndsAtEpochMs: null,
          stageRemainingDurationMs: null,
          stageId: null,
          stagePosition: null,
          stageTimeLimitSeconds: null,
          totalStages: lifecycle.totalStages,
        },
      },
    };
  }

  pause(state: HostPartyLifecycleState): HostPartyLifecycleTransitionResult {
    this.assertAction(state, 'pauseParty');
    this.requireLifecycle(state, PartyRuntimePhase.STAGE, PartyRuntimePhase.RESULT);

    if (state.status !== PartyStatus.ACTIVE) {
      throw new PartyCommandNotAvailableError(
        this.createLifecycleErrorContext(state, {
          reason: 'partyMustBeActiveToPause',
        }),
      );
    }

    if (state.runtime === null || state.runtime.lifecycle.phase !== PartyRuntimePhase.STAGE) {
      return {
        status: PartyStatus.PAUSED,
        runtime: state.runtime,
      };
    }

    const pausedRuntime: PartyRuntimeContext = {
      lifecycle: this.pauseLifecycleTimer(state.runtime.lifecycle),
      ...(state.runtime.stage ? { stage: state.runtime.stage } : {}),
    };

    return {
      status: PartyStatus.PAUSED,
      runtime: pausedRuntime,
    };
  }

  resume(state: HostPartyLifecycleState): HostPartyLifecycleTransitionResult {
    this.assertAction(state, 'resumeParty');
    this.requireLifecycle(state, PartyRuntimePhase.STAGE, PartyRuntimePhase.RESULT);

    if (state.status !== PartyStatus.PAUSED) {
      throw new PartyCommandNotAvailableError(
        this.createLifecycleErrorContext(state, {
          reason: 'partyMustBePausedToResume',
        }),
      );
    }

    if (state.runtime === null || state.runtime.lifecycle.phase !== PartyRuntimePhase.STAGE) {
      return {
        status: PartyStatus.ACTIVE,
        runtime: state.runtime,
      };
    }

    const resumedRuntime: PartyRuntimeContext = {
      lifecycle: this.resumeLifecycleTimer(state.runtime.lifecycle),
      ...(state.runtime.stage ? { stage: state.runtime.stage } : {}),
    };

    return {
      status: PartyStatus.ACTIVE,
      runtime: resumedRuntime,
    };
  }

  revealStageResult(state: HostPartyLifecycleState): HostPartyLifecycleTransitionResult {
    this.assertAction(state, 'revealStageResult');
    if (state.runtime === null || state.runtime.lifecycle.phase !== PartyRuntimePhase.STAGE) {
      throw new PartyCommandNotAvailableError(
        this.createLifecycleErrorContext(state, {
          reason: 'stageRuntimeRequiredForResultReveal',
        }),
      );
    }

    const resultRuntime: PartyRuntimeContext = {
      lifecycle: {
        ...state.runtime.lifecycle,
        phase: PartyRuntimePhase.RESULT,
      },
    };

    return {
      status: state.status,
      runtime: resultRuntime,
    };
  }

  endParty(state: HostPartyLifecycleState): HostPartyLifecycleTransitionResult {
    this.assertAction(state, 'endParty');
    if (state.status === PartyStatus.ENDED) {
      throw new PartyCommandNotAvailableError(
        this.createLifecycleErrorContext(state, {
          reason: 'partyAlreadyEnded',
        }),
      );
    }

    return {
      status: PartyStatus.ENDED,
      runtime: this.createEndedRuntime(
        state.runtime,
        state.runtime?.lifecycle.stageId ?? null,
        state.runtime?.lifecycle.stagePosition ?? null,
        state.runtime?.lifecycle.totalStages ?? 0,
      ),
    };
  }

  private createEndedRuntime(
    runtime: PartyRuntimeContext | null,
    stageId: PartyRuntimeLifecycleContext['stageId'],
    stagePosition: number | null,
    totalStages: number,
  ): PartyRuntimeContext {
    const result = runtime?.result;

    return {
      ...(result ? { result } : {}),
      lifecycle: {
        phase: PartyRuntimePhase.ENDED,
        stageEndsAtEpochMs: runtime?.lifecycle.stageEndsAtEpochMs ?? null,
        stageRemainingDurationMs: runtime?.lifecycle.stageRemainingDurationMs ?? null,
        stageId,
        stagePosition,
        stageTimeLimitSeconds: runtime?.lifecycle.stageTimeLimitSeconds ?? null,
        totalStages,
      },
    };
  }

  private createStageRuntime(
    stageId: NonNullable<PartyRuntimeLifecycleContext['stageId']>,
    stagePosition: number,
    totalStages: number,
    timeLimitSeconds: number,
    state: HostPartyLifecycleState,
  ): PartyRuntimeContext {
    const stageRemainingDurationMs = this.toStageDurationMs(timeLimitSeconds);
    const readingDurationMs =
      (state.questionReadingTimeSeconds ?? DEFAULT_PARTY_SETTINGS.questionReadingTimeSeconds) * 1_000;
    const isPaused = state.status === PartyStatus.PAUSED;
    const answeringStartsAtEpochMs = Date.now() + readingDurationMs;

    return {
      lifecycle: {
        phase: PartyRuntimePhase.STAGE,
        ...(readingDurationMs > 0
          ? {
              reading: {
                endsAtEpochMs: isPaused ? null : answeringStartsAtEpochMs,
                remainingDurationMs: readingDurationMs,
              },
            }
          : {}),
        stageEndsAtEpochMs:
          isPaused || stageRemainingDurationMs === null ? null : answeringStartsAtEpochMs + stageRemainingDurationMs,
        stageRemainingDurationMs,
        stageId,
        stagePosition,
        stageTimeLimitSeconds: timeLimitSeconds,
        totalStages,
      },
    };
  }

  private pauseLifecycleTimer(
    lifecycle: Extract<PartyRuntimeLifecycleContext, { phase: PartyRuntimePhase.STAGE }>,
  ): Extract<PartyRuntimeLifecycleContext, { phase: PartyRuntimePhase.STAGE }> {
    const nowEpochMs = Date.now();
    return {
      ...lifecycle,
      ...(lifecycle.reading
        ? {
            reading: {
              endsAtEpochMs: null,
              remainingDurationMs:
                lifecycle.reading.endsAtEpochMs === null
                  ? lifecycle.reading.remainingDurationMs
                  : Math.max(0, lifecycle.reading.endsAtEpochMs - nowEpochMs),
            },
          }
        : {}),
      stageEndsAtEpochMs: null,
      stageRemainingDurationMs: this.resolveRemainingDurationMs(lifecycle, nowEpochMs),
    };
  }

  private resumeLifecycleTimer(
    lifecycle: Extract<PartyRuntimeLifecycleContext, { phase: PartyRuntimePhase.STAGE }>,
  ): Extract<PartyRuntimeLifecycleContext, { phase: PartyRuntimePhase.STAGE }> {
    const answeringStartsAtEpochMs = Date.now() + (lifecycle.reading?.remainingDurationMs ?? 0);

    return {
      ...lifecycle,
      ...(lifecycle.reading
        ? {
            reading: {
              ...lifecycle.reading,
              endsAtEpochMs: answeringStartsAtEpochMs,
            },
          }
        : {}),
      stageEndsAtEpochMs:
        lifecycle.stageRemainingDurationMs === null
          ? null
          : answeringStartsAtEpochMs + lifecycle.stageRemainingDurationMs,
    };
  }

  private resolveRemainingDurationMs(
    lifecycle: PartyRuntimeLifecycleContext,
    nowEpochMs: number,
  ): PartyRuntimeLifecycleContext['stageRemainingDurationMs'] {
    if (lifecycle.stageEndsAtEpochMs === null) {
      return lifecycle.stageRemainingDurationMs;
    }

    return Math.max(
      0,
      Math.min((lifecycle.stageTimeLimitSeconds ?? 0) * 1_000, lifecycle.stageEndsAtEpochMs - nowEpochMs),
    );
  }

  private toStageDurationMs(timeLimitSeconds: number): number | null {
    if (timeLimitSeconds <= 0) {
      return null;
    }

    return timeLimitSeconds * 1_000;
  }

  private requireLifecycle(
    state: HostPartyLifecycleState,
    ...allowedPhases: readonly PartyRuntimeLifecycleContext['phase'][]
  ): PartyRuntimeLifecycleContext {
    const lifecycle = state.runtime?.lifecycle;

    if (!lifecycle || !allowedPhases.includes(lifecycle.phase)) {
      throw new PartyCommandNotAvailableError(
        this.createLifecycleErrorContext(state, {
          allowedPhases,
          reason: 'lifecyclePhaseUnavailable',
        }),
      );
    }

    if (state.status !== PartyStatus.ACTIVE && state.status !== PartyStatus.PAUSED) {
      throw new PartyCommandNotAvailableError(
        this.createLifecycleErrorContext(state, {
          allowedPhases,
          reason: 'partyStatusUnavailable',
        }),
      );
    }

    return lifecycle;
  }

  private createLifecycleErrorContext(
    state: HostPartyLifecycleState,
    context?: Record<string, unknown>,
  ): Record<string, unknown> {
    return {
      currentPhase: state.runtime?.lifecycle.phase ?? null,
      currentStageId: state.runtime?.lifecycle.stageId ?? null,
      currentStagePosition: state.runtime?.lifecycle.stagePosition ?? null,
      status: state.status,
      totalStages: state.runtime?.lifecycle.totalStages ?? null,
      ...context,
    };
  }
}
