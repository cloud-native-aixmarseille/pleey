import { Inject, Injectable } from '@nestjs/common';
import { HostPartyLifecyclePolicy } from '../../../../../domain/game/party/host/services/host-party-lifecycle-policy';
import { BroadcastPartyObservationUseCase } from '../../shared/use-cases/broadcast-party-observation-use-case';
import type { HostPartyControlDto } from '../dto/host-party-control.dto';
import { HostPartyRuntimeControlPort } from '../ports/host-party-runtime-control.port';
import { AbstractHostPartyRuntimeUseCase } from './abstract-host-party-runtime-use-case';

@Injectable()
export class PausePartyUseCase extends AbstractHostPartyRuntimeUseCase {
  constructor(
    @Inject(HostPartyRuntimeControlPort)
    hostPartyRuntimeControl: HostPartyRuntimeControlPort,
    broadcastPartyObservationUseCase: BroadcastPartyObservationUseCase,
    hostPartyLifecyclePolicy: HostPartyLifecyclePolicy,
  ) {
    super(hostPartyRuntimeControl, broadcastPartyObservationUseCase, hostPartyLifecyclePolicy);
  }

  execute(input: HostPartyControlDto): Promise<void> {
    return this.executeTransition(input, (party) =>
      this.hostPartyLifecyclePolicy.pause(this.toLifecycleState(party)),
    );
  }
}
