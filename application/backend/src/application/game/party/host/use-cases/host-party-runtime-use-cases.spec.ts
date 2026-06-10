import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import { HostPartyLifecyclePolicy } from '../../../../../domain/game/party/host/services/host-party-lifecycle-policy';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { HostPartyRuntimeStageReferenceResolver } from '../services/host-party-runtime-stage-reference-resolver';
import { AdvanceStageUseCase } from './advance-stage-use-case';
import { RestartStageUseCase } from './restart-stage-use-case';
import { RevealStageResultUseCase } from './reveal-stage-result-use-case';
import { RewindPartyUseCase } from './rewind-party-use-case';
import { RewindStageUseCase } from './rewind-stage-use-case';
import { StartPartyUseCase } from './start-party-use-case';

const GAME_ID = backendTestIdentifiers.game(9);
const PARTY_ID = backendTestIdentifiers.party(44);
const HOST_USER_ID = backendTestIdentifiers.user(7);
const OTHER_USER_ID = backendTestIdentifiers.user(99);
const STAGE_101 = backendTestIdentifiers.partyStage(101);
const STAGE_202 = backendTestIdentifiers.partyStage(202);
const STAGE_303 = backendTestIdentifiers.partyStage(303);
const DEFAULT_PARTY_SETTINGS = {
  allowOptionChangeAfterVoting: false,
  randomizeOptionOrder: false,
  randomizeStageOrder: false,
} as const;

describe('Host party runtime use cases', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts a host-controlled party and broadcasts the updated observation', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);

    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: null,
        gameId: GAME_ID,
        hostUserId: HOST_USER_ID,
        partyId: PARTY_ID,
        settings: DEFAULT_PARTY_SETTINGS,
        status: PartyStatus.WAITING,
      }),
      savePartyRuntime: vi.fn().mockResolvedValue(undefined),
    };
    const partyStageConfiguration = {
      getStageCount: vi.fn().mockResolvedValue(3),
    };
    const partyStageCatalog = {
      findFirstStage: vi
        .fn()
        .mockResolvedValue({ id: STAGE_101, stagePosition: 0, timeLimitSeconds: 20 }),
    };
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new StartPartyUseCase(
      hostPartyRuntimeControl as never,
      new HostPartyRuntimeStageReferenceResolver(
        partyStageConfiguration as never,
        partyStageCatalog as never,
      ),
      broadcastPartyObservationUseCase as never,
      new HostPartyLifecyclePolicy(),
    );

    await useCase.execute({
      hostUserId: HOST_USER_ID,
      partyId: PARTY_ID,
    });

    expect(partyStageConfiguration.getStageCount).toHaveBeenCalledWith(GAME_ID);
    expect(partyStageCatalog.findFirstStage).toHaveBeenCalledWith(GAME_ID, {
      partyId: PARTY_ID,
      settings: DEFAULT_PARTY_SETTINGS,
    });
    expect(hostPartyRuntimeControl.savePartyRuntime).toHaveBeenCalledWith({
      context: {
        lifecycle: {
          phase: 'stage',
          stageEndsAtEpochMs: 120_000,
          stageRemainingDurationMs: 20_000,
          stageId: STAGE_101,
          stagePosition: 0,
          stageTimeLimitSeconds: 20,
          totalStages: 3,
        },
      },
      partyId: PARTY_ID,
      status: PartyStatus.ACTIVE,
    });
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({
      partyId: PARTY_ID,
    });
  });

  it('rejects host commands from non-host users', async () => {
    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: null,
        gameId: GAME_ID,
        hostUserId: HOST_USER_ID,
        partyId: PARTY_ID,
        settings: DEFAULT_PARTY_SETTINGS,
        status: PartyStatus.WAITING,
      }),
      savePartyRuntime: vi.fn(),
    };
    const useCase = new StartPartyUseCase(
      hostPartyRuntimeControl as never,
      new HostPartyRuntimeStageReferenceResolver(
        {
          getStageCount: vi.fn(),
        } as never,
        {
          findFirstStage: vi.fn(),
        } as never,
      ),
      {
        execute: vi.fn(),
      } as never,
      new HostPartyLifecyclePolicy(),
    );

    await expect(
      useCase.execute({
        hostUserId: OTHER_USER_ID,
        partyId: PARTY_ID,
      }),
    ).rejects.toThrow(GameErrorCode.HOST_PARTY_CONTROL_FORBIDDEN);
  });

  it('persists and broadcasts generic lifecycle transitions', async () => {
    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: {
          lifecycle: {
            phase: 'stage',
            stageEndsAtEpochMs: 120_000,
            stageRemainingDurationMs: 20_000,
            stageId: STAGE_202,
            stagePosition: 1,
            stageTimeLimitSeconds: 20,
            totalStages: 4,
          },
        },
        gameId: GAME_ID,
        hostUserId: HOST_USER_ID,
        partyId: PARTY_ID,
        settings: DEFAULT_PARTY_SETTINGS,
        status: PartyStatus.ACTIVE,
      }),
      savePartyRuntime: vi.fn().mockResolvedValue(undefined),
    };
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new RevealStageResultUseCase(
      hostPartyRuntimeControl as never,
      broadcastPartyObservationUseCase as never,
      new HostPartyLifecyclePolicy(),
    );

    await useCase.execute({
      hostUserId: HOST_USER_ID,
      partyId: PARTY_ID,
    });

    expect(hostPartyRuntimeControl.savePartyRuntime).toHaveBeenCalledWith({
      context: {
        lifecycle: {
          phase: 'result',
          stageEndsAtEpochMs: 120_000,
          stageRemainingDurationMs: 20_000,
          stageId: STAGE_202,
          stagePosition: 1,
          stageTimeLimitSeconds: 20,
          totalStages: 4,
        },
      },
      partyId: PARTY_ID,
      status: PartyStatus.ACTIVE,
    });
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({
      partyId: PARTY_ID,
    });
  });

  it('advances to the next stage using stage position lookup', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000);

    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: {
          lifecycle: {
            phase: 'result',
            stageEndsAtEpochMs: 120_000,
            stageRemainingDurationMs: 20_000,
            stageId: STAGE_202,
            stagePosition: 1,
            stageTimeLimitSeconds: 20,
            totalStages: 4,
          },
        },
        gameId: GAME_ID,
        hostUserId: HOST_USER_ID,
        partyId: PARTY_ID,
        settings: DEFAULT_PARTY_SETTINGS,
        status: PartyStatus.ACTIVE,
      }),
      savePartyRuntime: vi.fn().mockResolvedValue(undefined),
    };
    const partyStageCatalog = {
      findNextStage: vi
        .fn()
        .mockResolvedValue({ id: STAGE_303, stagePosition: 2, timeLimitSeconds: 15 }),
    };
    const useCase = new AdvanceStageUseCase(
      hostPartyRuntimeControl as never,
      new HostPartyRuntimeStageReferenceResolver(
        {
          getStageCount: vi.fn(),
        } as never,
        partyStageCatalog as never,
      ),
      {
        execute: vi.fn().mockResolvedValue(undefined),
      } as never,
      new HostPartyLifecyclePolicy(),
    );

    await useCase.execute({
      hostUserId: HOST_USER_ID,
      partyId: PARTY_ID,
    });

    expect(partyStageCatalog.findNextStage).toHaveBeenCalledWith(GAME_ID, STAGE_202, {
      partyId: PARTY_ID,
      settings: DEFAULT_PARTY_SETTINGS,
    });
    expect(hostPartyRuntimeControl.savePartyRuntime).toHaveBeenCalledWith({
      context: {
        lifecycle: {
          phase: 'stage',
          stageEndsAtEpochMs: 115_000,
          stageRemainingDurationMs: 15_000,
          stageId: STAGE_303,
          stagePosition: 2,
          stageTimeLimitSeconds: 15,
          totalStages: 4,
        },
      },
      partyId: PARTY_ID,
      status: PartyStatus.ACTIVE,
    });
  });

  it('restarts the current stage and marks that stage for player progress reset', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(150_000);

    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: {
          lifecycle: {
            phase: 'result',
            stageEndsAtEpochMs: 120_000,
            stageRemainingDurationMs: 20_000,
            stageId: STAGE_202,
            stagePosition: 1,
            stageTimeLimitSeconds: 20,
            totalStages: 4,
          },
        },
        gameId: GAME_ID,
        hostUserId: HOST_USER_ID,
        partyId: PARTY_ID,
        settings: DEFAULT_PARTY_SETTINGS,
        status: PartyStatus.ACTIVE,
      }),
      savePartyRuntime: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new RestartStageUseCase(
      hostPartyRuntimeControl as never,
      {
        execute: vi.fn().mockResolvedValue(undefined),
      } as never,
      new HostPartyLifecyclePolicy(),
    );

    await useCase.execute({
      hostUserId: HOST_USER_ID,
      partyId: PARTY_ID,
    });

    expect(hostPartyRuntimeControl.savePartyRuntime).toHaveBeenCalledWith({
      context: {
        lifecycle: {
          phase: 'stage',
          stageEndsAtEpochMs: 170_000,
          stageRemainingDurationMs: 20_000,
          stageId: STAGE_202,
          stagePosition: 1,
          stageTimeLimitSeconds: 20,
          totalStages: 4,
        },
      },
      partyId: PARTY_ID,
      resetPlayerProgress: {
        fromStageId: STAGE_202,
        gameId: GAME_ID,
        partyId: PARTY_ID,
        settings: DEFAULT_PARTY_SETTINGS,
      },
      status: PartyStatus.ACTIVE,
    });
  });

  it('rewinds to the previous stage and marks the rewound range for player progress reset', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(180_000);

    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: {
          lifecycle: {
            phase: 'stage',
            stageEndsAtEpochMs: 120_000,
            stageRemainingDurationMs: 20_000,
            stageId: STAGE_303,
            stagePosition: 2,
            stageTimeLimitSeconds: 20,
            totalStages: 4,
          },
        },
        gameId: GAME_ID,
        hostUserId: HOST_USER_ID,
        partyId: PARTY_ID,
        settings: DEFAULT_PARTY_SETTINGS,
        status: PartyStatus.ACTIVE,
      }),
      savePartyRuntime: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new RewindStageUseCase(
      hostPartyRuntimeControl as never,
      new HostPartyRuntimeStageReferenceResolver(
        {
          getStageCount: vi.fn(),
        } as never,
        {
          findPreviousStage: vi
            .fn()
            .mockResolvedValue({ id: STAGE_202, stagePosition: 1, timeLimitSeconds: 25 }),
        } as never,
      ),
      {
        execute: vi.fn().mockResolvedValue(undefined),
      } as never,
      new HostPartyLifecyclePolicy(),
    );

    await useCase.execute({
      hostUserId: HOST_USER_ID,
      partyId: PARTY_ID,
    });

    expect(hostPartyRuntimeControl.savePartyRuntime).toHaveBeenCalledWith({
      context: {
        lifecycle: {
          phase: 'stage',
          stageEndsAtEpochMs: 205_000,
          stageRemainingDurationMs: 25_000,
          stageId: STAGE_202,
          stagePosition: 1,
          stageTimeLimitSeconds: 25,
          totalStages: 4,
        },
      },
      partyId: PARTY_ID,
      resetPlayerProgress: {
        fromStageId: STAGE_202,
        gameId: GAME_ID,
        partyId: PARTY_ID,
        settings: DEFAULT_PARTY_SETTINGS,
      },
      status: PartyStatus.ACTIVE,
    });
  });

  it('rewinds the party to the lobby and clears all player progress', async () => {
    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: {
          lifecycle: {
            phase: 'result',
            stageEndsAtEpochMs: 120_000,
            stageRemainingDurationMs: 20_000,
            stageId: STAGE_303,
            stagePosition: 2,
            stageTimeLimitSeconds: 20,
            totalStages: 4,
          },
        },
        gameId: GAME_ID,
        hostUserId: HOST_USER_ID,
        partyId: PARTY_ID,
        settings: DEFAULT_PARTY_SETTINGS,
        status: PartyStatus.ACTIVE,
      }),
      savePartyRuntime: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new RewindPartyUseCase(
      hostPartyRuntimeControl as never,
      {
        execute: vi.fn().mockResolvedValue(undefined),
      } as never,
      new HostPartyLifecyclePolicy(),
    );

    await useCase.execute({
      hostUserId: HOST_USER_ID,
      partyId: PARTY_ID,
    });

    expect(hostPartyRuntimeControl.savePartyRuntime).toHaveBeenCalledWith({
      context: {
        lifecycle: {
          phase: 'lobby',
          stageEndsAtEpochMs: null,
          stageRemainingDurationMs: null,
          stageId: null,
          stagePosition: null,
          stageTimeLimitSeconds: null,
          totalStages: 4,
        },
      },
      partyId: PARTY_ID,
      resetPlayerProgress: {
        fromStageId: null,
        gameId: GAME_ID,
        partyId: PARTY_ID,
        settings: DEFAULT_PARTY_SETTINGS,
      },
      status: PartyStatus.WAITING,
    });
  });
});
