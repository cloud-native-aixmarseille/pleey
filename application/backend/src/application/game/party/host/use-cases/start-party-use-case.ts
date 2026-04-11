import { Inject, Injectable } from '@nestjs/common';
import { HostPartyLifecyclePolicy } from '../../../../../domain/game/party/host/services/host-party-lifecycle-policy';
import { BroadcastPartyObservationUseCase } from '../../shared/use-cases/broadcast-party-observation-use-case';
import type { HostPartyControlDto } from '../dto/host-party-control.dto';
import { HostPartyRuntimeControlPort } from '../ports/host-party-runtime-control.port';
import { HostPartyRuntimeStageReferenceResolver } from '../services/host-party-runtime-stage-reference-resolver';
import { AbstractHostPartyRuntimeUseCase } from './abstract-host-party-runtime-use-case';

@Injectable()
export class StartPartyUseCase extends AbstractHostPartyRuntimeUseCase {
  constructor(
    @Inject(HostPartyRuntimeControlPort)
    hostPartyRuntimeControl: HostPartyRuntimeControlPort,
    private readonly hostPartyRuntimeStageReferenceResolver: HostPartyRuntimeStageReferenceResolver,
    broadcastPartyObservationUseCase: BroadcastPartyObservationUseCase,
    hostPartyLifecyclePolicy: HostPartyLifecyclePolicy,
  ) {
    super(hostPartyRuntimeControl, broadcastPartyObservationUseCase, hostPartyLifecyclePolicy);
  }

  async execute(input: HostPartyControlDto): Promise<void> {
    const party = await this.loadControlledParty(input);
    const transition = this.hostPartyLifecyclePolicy.start(
      this.toLifecycleState(party),
      await this.hostPartyRuntimeStageReferenceResolver.resolveStartState(party.gameId),
    );

    await this.persistTransition(input.partyId, transition.status, transition.runtime);
  }
}
