import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import type { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import { HostPartyLifecyclePolicy } from '../../../../../domain/game/party/host/services/host-party-lifecycle-policy';
import type { PartyRuntimeContext } from '../../../../../domain/game/party/shared/entities/party-runtime-context';
import type { PartyStageId } from '../../../../../domain/game/party/shared/entities/party-stage';
import { BroadcastPartyObservationUseCase } from '../../shared/use-cases/broadcast-party-observation-use-case';
import type { HostPartyControlDto } from '../dto/host-party-control.dto';
import {
  type HostControlledPartyRuntime,
  type HostPartyRuntimeControlPort,
} from '../ports/host-party-runtime-control.port';

interface HostPartyRuntimeTransition {
  readonly runtime: PartyRuntimeContext | null;
  readonly status: PartyStatus;
}

export abstract class AbstractHostPartyRuntimeUseCase {
  protected constructor(
    protected readonly hostPartyRuntimeControl: HostPartyRuntimeControlPort,
    protected readonly broadcastPartyObservationUseCase: BroadcastPartyObservationUseCase,
    protected readonly hostPartyLifecyclePolicy: HostPartyLifecyclePolicy,
  ) {}

  protected async executeTransition(
    input: HostPartyControlDto,
    resolveTransition: (
      party: HostControlledPartyRuntime,
    ) => HostPartyRuntimeTransition | Promise<HostPartyRuntimeTransition>,
    resolveResetPlayerProgress?: (
      party: HostControlledPartyRuntime,
      transition: HostPartyRuntimeTransition,
    ) => {
      readonly fromStageId: PartyStageId | null;
      readonly gameId: HostControlledPartyRuntime['gameId'];
      readonly partyId: HostControlledPartyRuntime['partyId'];
      readonly settings: HostControlledPartyRuntime['settings'];
    },
  ): Promise<void> {
    const party = await this.loadControlledParty(input);
    const transition = await resolveTransition(party);

    await this.persistTransition(
      input.partyId,
      transition.status,
      transition.runtime,
      resolveResetPlayerProgress?.(party, transition),
    );
  }

  protected toLifecycleState(party: HostControlledPartyRuntime): {
    readonly runtime: PartyRuntimeContext | null;
    readonly status: PartyStatus;
  } {
    return {
      runtime: party.context,
      status: party.status,
    };
  }

  protected async loadControlledParty(
    input: HostPartyControlDto,
  ): Promise<HostControlledPartyRuntime> {
    const party = await this.hostPartyRuntimeControl.findPartyRuntimeByPartyId(input.partyId);

    if (!party) {
      throw new Error(GameErrorCode.PARTY_NOT_FOUND);
    }

    if (party.hostUserId !== input.hostUserId) {
      throw new Error(GameErrorCode.HOST_PARTY_CONTROL_FORBIDDEN);
    }

    return party;
  }

  protected async persistTransition(
    partyId: HostPartyControlDto['partyId'],
    status: PartyStatus,
    context: PartyRuntimeContext | null,
    resetPlayerProgress?: {
      readonly fromStageId: PartyStageId | null;
      readonly gameId: HostControlledPartyRuntime['gameId'];
      readonly partyId: HostControlledPartyRuntime['partyId'];
      readonly settings: HostControlledPartyRuntime['settings'];
    },
  ): Promise<void> {
    await this.hostPartyRuntimeControl.savePartyRuntime({
      context,
      partyId,
      ...(resetPlayerProgress ? { resetPlayerProgress } : {}),
      status,
    });
    await this.broadcastPartyObservationUseCase.execute({ partyId });
  }
}
