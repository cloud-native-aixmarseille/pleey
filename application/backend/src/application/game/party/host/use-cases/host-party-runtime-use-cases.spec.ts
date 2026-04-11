import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import { HostPartyLifecyclePolicy } from '../../../../../domain/game/party/host/services/host-party-lifecycle-policy';
import { GameIdentifier } from '../../../../game/shared/services/identifiers/game-identifier';
import { UserIdentifier } from '../../../../identity/shared/services/identifiers/user-identifier';
import { PartyIdentifier } from '../../shared/services/identifiers/party-identifier';
import { HostPartyRuntimeStageReferenceResolver } from '../services/host-party-runtime-stage-reference-resolver';
import { AdvanceStageUseCase } from './advance-stage-use-case';
import { RestartStageUseCase } from './restart-stage-use-case';
import { RevealStageResultUseCase } from './reveal-stage-result-use-case';
import { RewindPartyUseCase } from './rewind-party-use-case';
import { RewindStageUseCase } from './rewind-stage-use-case';
import { StartPartyUseCase } from './start-party-use-case';

const gameIdentifier = new GameIdentifier();
const partyIdentifier = new PartyIdentifier();
const userIdentifier = new UserIdentifier();

describe('Host party runtime use cases', () => {
  it('starts a host-controlled party and broadcasts the updated observation', async () => {
    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: null,
        gameId: gameIdentifier.parse(9),
        hostUserId: userIdentifier.parse(7),
        partyId: partyIdentifier.parse(44),
        status: PartyStatus.WAITING,
      }),
      savePartyRuntime: vi.fn().mockResolvedValue(undefined),
    };
    const partyStageConfiguration = {
      getStageCount: vi.fn().mockResolvedValue(3),
    };
    const partyStageCatalog = {
      findFirstStage: vi.fn().mockResolvedValue({ id: 101, stagePosition: 0 }),
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
      hostUserId: userIdentifier.parse(7),
      partyId: partyIdentifier.parse(44),
    });

    expect(partyStageConfiguration.getStageCount).toHaveBeenCalledWith(gameIdentifier.parse(9));
    expect(partyStageCatalog.findFirstStage).toHaveBeenCalledWith(gameIdentifier.parse(9));
    expect(hostPartyRuntimeControl.savePartyRuntime).toHaveBeenCalledWith({
      context: {
        lifecycle: {
          phase: 'stage',
          stageId: 101,
          stagePosition: 0,
          totalStages: 3,
        },
      },
      partyId: partyIdentifier.parse(44),
      status: PartyStatus.ACTIVE,
    });
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({
      partyId: partyIdentifier.parse(44),
    });
  });

  it('rejects host commands from non-host users', async () => {
    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: null,
        gameId: gameIdentifier.parse(9),
        hostUserId: userIdentifier.parse(7),
        partyId: partyIdentifier.parse(44),
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
        hostUserId: userIdentifier.parse(99),
        partyId: partyIdentifier.parse(44),
      }),
    ).rejects.toThrow(GameErrorCode.HOST_PARTY_CONTROL_FORBIDDEN);
  });

  it('persists and broadcasts generic lifecycle transitions', async () => {
    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: {
          lifecycle: {
            phase: 'stage',
            stageId: 202,
            stagePosition: 1,
            totalStages: 4,
          },
        },
        gameId: gameIdentifier.parse(9),
        hostUserId: userIdentifier.parse(7),
        partyId: partyIdentifier.parse(44),
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
      hostUserId: userIdentifier.parse(7),
      partyId: partyIdentifier.parse(44),
    });

    expect(hostPartyRuntimeControl.savePartyRuntime).toHaveBeenCalledWith({
      context: {
        lifecycle: {
          phase: 'result',
          stageId: 202,
          stagePosition: 1,
          totalStages: 4,
        },
      },
      partyId: partyIdentifier.parse(44),
      status: PartyStatus.ACTIVE,
    });
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({
      partyId: partyIdentifier.parse(44),
    });
  });

  it('advances to the next stage using stage position lookup', async () => {
    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: {
          lifecycle: {
            phase: 'result',
            stageId: 202,
            stagePosition: 1,
            totalStages: 4,
          },
        },
        gameId: gameIdentifier.parse(9),
        hostUserId: userIdentifier.parse(7),
        partyId: partyIdentifier.parse(44),
        status: PartyStatus.ACTIVE,
      }),
      savePartyRuntime: vi.fn().mockResolvedValue(undefined),
    };
    const partyStageCatalog = {
      findNextStage: vi.fn().mockResolvedValue({ id: 303, stagePosition: 2 }),
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
      hostUserId: userIdentifier.parse(7),
      partyId: partyIdentifier.parse(44),
    });

    expect(partyStageCatalog.findNextStage).toHaveBeenCalledWith(gameIdentifier.parse(9), 202);
    expect(hostPartyRuntimeControl.savePartyRuntime).toHaveBeenCalledWith({
      context: {
        lifecycle: {
          phase: 'stage',
          stageId: 303,
          stagePosition: 2,
          totalStages: 4,
        },
      },
      partyId: partyIdentifier.parse(44),
      status: PartyStatus.ACTIVE,
    });
  });

  it('restarts the current stage and marks that stage for player progress reset', async () => {
    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: {
          lifecycle: {
            phase: 'result',
            stageId: 202,
            stagePosition: 1,
            totalStages: 4,
          },
        },
        gameId: gameIdentifier.parse(9),
        hostUserId: userIdentifier.parse(7),
        partyId: partyIdentifier.parse(44),
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
      hostUserId: userIdentifier.parse(7),
      partyId: partyIdentifier.parse(44),
    });

    expect(hostPartyRuntimeControl.savePartyRuntime).toHaveBeenCalledWith({
      context: {
        lifecycle: {
          phase: 'stage',
          stageId: 202,
          stagePosition: 1,
          totalStages: 4,
        },
      },
      partyId: partyIdentifier.parse(44),
      resetPlayerProgress: {
        fromStageId: 202,
        gameId: gameIdentifier.parse(9),
      },
      status: PartyStatus.ACTIVE,
    });
  });

  it('rewinds to the previous stage and marks the rewound range for player progress reset', async () => {
    const hostPartyRuntimeControl = {
      findPartyRuntimeByPartyId: vi.fn().mockResolvedValue({
        context: {
          lifecycle: {
            phase: 'stage',
            stageId: 303,
            stagePosition: 2,
            totalStages: 4,
          },
        },
        gameId: gameIdentifier.parse(9),
        hostUserId: userIdentifier.parse(7),
        partyId: partyIdentifier.parse(44),
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
          findPreviousStage: vi.fn().mockResolvedValue({ id: 202, stagePosition: 1 }),
        } as never,
      ),
      {
        execute: vi.fn().mockResolvedValue(undefined),
      } as never,
      new HostPartyLifecyclePolicy(),
    );

    await useCase.execute({
      hostUserId: userIdentifier.parse(7),
      partyId: partyIdentifier.parse(44),
    });

    expect(hostPartyRuntimeControl.savePartyRuntime).toHaveBeenCalledWith({
      context: {
        lifecycle: {
          phase: 'stage',
          stageId: 202,
          stagePosition: 1,
          totalStages: 4,
        },
      },
      partyId: partyIdentifier.parse(44),
      resetPlayerProgress: {
        fromStageId: 202,
        gameId: gameIdentifier.parse(9),
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
            stageId: 303,
            stagePosition: 2,
            totalStages: 4,
          },
        },
        gameId: gameIdentifier.parse(9),
        hostUserId: userIdentifier.parse(7),
        partyId: partyIdentifier.parse(44),
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
      hostUserId: userIdentifier.parse(7),
      partyId: partyIdentifier.parse(44),
    });

    expect(hostPartyRuntimeControl.savePartyRuntime).toHaveBeenCalledWith({
      context: {
        lifecycle: {
          phase: 'lobby',
          stageId: null,
          stagePosition: null,
          totalStages: 4,
        },
      },
      partyId: partyIdentifier.parse(44),
      resetPlayerProgress: {
        fromStageId: null,
        gameId: gameIdentifier.parse(9),
      },
      status: PartyStatus.WAITING,
    });
  });
});
