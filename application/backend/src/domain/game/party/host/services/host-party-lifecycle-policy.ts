import { GameErrorCode } from '../../../enums/game-error-code.enum';
import { PartyStatus } from '../../enums/party-status.enum';
import {
  type PartyRuntimeContext,
  type PartyRuntimeLifecycleContext,
  PartyRuntimePhase,
} from '../../shared/entities/party-runtime-context';

interface HostPartyLifecycleState {
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
  start(
    state: HostPartyLifecycleState,
    input: {
      readonly firstStage: HostPartyStageReference | null;
      readonly totalStages: number;
    },
  ): HostPartyLifecycleTransitionResult {
    if (state.status !== PartyStatus.WAITING) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
    }

    if (input.totalStages <= 0 || input.firstStage === null) {
      throw new Error(GameErrorCode.PARTY_STAGES_NOT_AVAILABLE);
    }

    return {
      status: PartyStatus.ACTIVE,
      runtime: this.createStageRuntime(
        input.firstStage.id,
        input.firstStage.stagePosition,
        input.totalStages,
        input.firstStage.timeLimitSeconds,
      ),
    };
  }

  advanceStage(
    state: HostPartyLifecycleState,
    input: {
      readonly nextStage: HostPartyStageReference | null;
    },
  ): HostPartyLifecycleTransitionResult {
    const lifecycle = this.requireLifecycle(state, PartyRuntimePhase.RESULT);

    if (lifecycle.stageId === null || lifecycle.stagePosition === null) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
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
      ),
    };
  }

  restartStage(state: HostPartyLifecycleState): HostPartyLifecycleTransitionResult {
    const lifecycle = this.requireLifecycle(
      state,
      PartyRuntimePhase.STAGE,
      PartyRuntimePhase.RESULT,
    );

    if (
      lifecycle.stageId === null ||
      lifecycle.stagePosition === null ||
      lifecycle.stageTimeLimitSeconds === null
    ) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
    }

    return {
      status: state.status,
      runtime: this.createStageRuntime(
        lifecycle.stageId,
        lifecycle.stagePosition,
        lifecycle.totalStages,
        lifecycle.stageTimeLimitSeconds,
      ),
    };
  }

  rewindStage(
    state: HostPartyLifecycleState,
    input: {
      readonly previousStage: HostPartyStageReference | null;
    },
  ): HostPartyLifecycleTransitionResult {
    const lifecycle = this.requireLifecycle(
      state,
      PartyRuntimePhase.STAGE,
      PartyRuntimePhase.RESULT,
    );

    if (
      lifecycle.stageId === null ||
      lifecycle.stagePosition === null ||
      input.previousStage === null
    ) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
    }

    return {
      status: state.status,
      runtime: this.createStageRuntime(
        input.previousStage.id,
        input.previousStage.stagePosition,
        lifecycle.totalStages,
        input.previousStage.timeLimitSeconds,
      ),
    };
  }

  rewindParty(state: HostPartyLifecycleState): HostPartyLifecycleTransitionResult {
    const lifecycle = this.requireLifecycle(
      state,
      PartyRuntimePhase.STAGE,
      PartyRuntimePhase.RESULT,
    );

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
    this.requireLifecycle(state, PartyRuntimePhase.STAGE, PartyRuntimePhase.RESULT);

    if (state.status !== PartyStatus.ACTIVE) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
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
    this.requireLifecycle(state, PartyRuntimePhase.STAGE, PartyRuntimePhase.RESULT);

    if (state.status !== PartyStatus.PAUSED) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
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
    if (state.runtime === null || state.runtime.lifecycle.phase !== PartyRuntimePhase.STAGE) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
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
    if (state.status === PartyStatus.ENDED) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
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
  ): PartyRuntimeContext {
    const stageRemainingDurationMs = this.toStageDurationMs(timeLimitSeconds);

    return {
      lifecycle: {
        phase: PartyRuntimePhase.STAGE,
        stageEndsAtEpochMs:
          stageRemainingDurationMs === null ? null : Date.now() + stageRemainingDurationMs,
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
    return {
      ...lifecycle,
      stageEndsAtEpochMs: null,
      stageRemainingDurationMs: this.resolveRemainingDurationMs(lifecycle),
    };
  }

  private resumeLifecycleTimer(
    lifecycle: Extract<PartyRuntimeLifecycleContext, { phase: PartyRuntimePhase.STAGE }>,
  ): Extract<PartyRuntimeLifecycleContext, { phase: PartyRuntimePhase.STAGE }> {
    if (lifecycle.stageRemainingDurationMs === null) {
      return lifecycle;
    }

    return {
      ...lifecycle,
      stageEndsAtEpochMs: Date.now() + lifecycle.stageRemainingDurationMs,
    };
  }

  private resolveRemainingDurationMs(
    lifecycle: PartyRuntimeLifecycleContext,
  ): PartyRuntimeLifecycleContext['stageRemainingDurationMs'] {
    if (lifecycle.stageEndsAtEpochMs === null) {
      return lifecycle.stageRemainingDurationMs;
    }

    return Math.max(0, lifecycle.stageEndsAtEpochMs - Date.now());
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
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
    }

    if (state.status !== PartyStatus.ACTIVE && state.status !== PartyStatus.PAUSED) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
    }

    return lifecycle;
  }
}
