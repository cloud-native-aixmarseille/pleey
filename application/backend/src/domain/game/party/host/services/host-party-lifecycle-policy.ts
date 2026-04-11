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
      ),
    };
  }

  restartStage(state: HostPartyLifecycleState): HostPartyLifecycleTransitionResult {
    const lifecycle = this.requireLifecycle(
      state,
      PartyRuntimePhase.STAGE,
      PartyRuntimePhase.RESULT,
    );

    if (lifecycle.stageId === null || lifecycle.stagePosition === null) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
    }

    return {
      status: state.status,
      runtime: this.createStageRuntime(
        lifecycle.stageId,
        lifecycle.stagePosition,
        lifecycle.totalStages,
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
          stageId: null,
          stagePosition: null,
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

    return {
      status: PartyStatus.PAUSED,
      runtime: state.runtime,
    };
  }

  resume(state: HostPartyLifecycleState): HostPartyLifecycleTransitionResult {
    this.requireLifecycle(state, PartyRuntimePhase.STAGE, PartyRuntimePhase.RESULT);

    if (state.status !== PartyStatus.PAUSED) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
    }

    return {
      status: PartyStatus.ACTIVE,
      runtime: state.runtime,
    };
  }

  revealStageResult(state: HostPartyLifecycleState): HostPartyLifecycleTransitionResult {
    const lifecycle = this.requireLifecycle(state, PartyRuntimePhase.STAGE);

    return {
      status: state.status,
      runtime: {
        lifecycle: {
          phase: PartyRuntimePhase.RESULT,
          stageId: lifecycle.stageId,
          stagePosition: lifecycle.stagePosition,
          totalStages: lifecycle.totalStages,
        },
      },
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
    return {
      ...runtime,
      lifecycle: {
        phase: PartyRuntimePhase.ENDED,
        stageId,
        stagePosition,
        totalStages,
      },
    };
  }

  private createStageRuntime(
    stageId: NonNullable<PartyRuntimeLifecycleContext['stageId']>,
    stagePosition: number,
    totalStages: number,
  ): PartyRuntimeContext {
    return {
      lifecycle: {
        phase: PartyRuntimePhase.STAGE,
        stageId,
        stagePosition,
        totalStages,
      },
    };
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
