import type { PartyId } from '@pleey/contracts/party';
import { inject, injectable } from 'inversify';
import {
  type HostPartyPlayerControlCommand,
  type PartyHostControlPort,
  PartyHostControlPortToken,
} from '../../../../../domains/game/party/host/ports/party-host-control.port';
import { HostPartyRuntimeCommand } from '../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import {
  type PartyManagementPort,
  PartyManagementPortToken,
} from '../../../../../domains/game/party/host/ports/party-management.port';
import {
  type PartyJoinCommand,
  type PartyJoinReceipt,
  type PartyPlayerPort,
  PartyPlayerPortToken,
  type PartySubmitActionCommand,
} from '../../../../../domains/game/party/player/ports/party-player.port';
import type { Party } from '../../../../../domains/game/party/shared/entities/party';

export interface PartyLobbyGateway {
  executeHostRuntimeCommand(command: HostPartyRuntimeCommand, partyId: PartyId): Promise<void>;
  joinParty(command: PartyJoinCommand): Promise<PartyJoinReceipt>;
  kickPlayer(command: HostPartyPlayerControlCommand): Promise<void>;
  leaveParty(): Promise<boolean>;
  listParties(): Promise<readonly Party[]>;
  rejoinParty(command: PartyJoinCommand): Promise<PartyJoinReceipt>;
  submitAction(command: PartySubmitActionCommand): Promise<void>;
}

@injectable()
export class PartyLobbyFacade implements PartyLobbyGateway {
  constructor(
    @inject(PartyHostControlPortToken)
    private readonly partyHostControlPort: PartyHostControlPort,
    @inject(PartyManagementPortToken)
    private readonly partyManagementPort: PartyManagementPort,
    @inject(PartyPlayerPortToken)
    private readonly partyPlayerPort: PartyPlayerPort,
  ) {}

  async executeHostRuntimeCommand(command: HostPartyRuntimeCommand, partyId: PartyId): Promise<void> {
    const hostCommand = { partyId };

    switch (command) {
      case HostPartyRuntimeCommand.AdvanceStage:
        await this.partyHostControlPort.advanceStage(hostCommand);
        return;
      case HostPartyRuntimeCommand.EndParty:
        await this.partyHostControlPort.endParty(hostCommand);
        return;
      case HostPartyRuntimeCommand.PauseParty:
        await this.partyHostControlPort.pauseParty(hostCommand);
        return;
      case HostPartyRuntimeCommand.RestartStage:
        await this.partyHostControlPort.restartStage(hostCommand);
        return;
      case HostPartyRuntimeCommand.ResumeParty:
        await this.partyHostControlPort.resumeParty(hostCommand);
        return;
      case HostPartyRuntimeCommand.RevealStageResult:
        await this.partyHostControlPort.revealStageResult(hostCommand);
        return;
      case HostPartyRuntimeCommand.RewindParty:
        await this.partyHostControlPort.rewindParty(hostCommand);
        return;
      case HostPartyRuntimeCommand.RewindStage:
        await this.partyHostControlPort.rewindStage(hostCommand);
        return;
      case HostPartyRuntimeCommand.StartParty:
        await this.partyHostControlPort.startParty(hostCommand);
        return;
    }
  }

  joinParty(command: PartyJoinCommand): Promise<PartyJoinReceipt> {
    return this.enterParty(command, false);
  }

  kickPlayer(command: HostPartyPlayerControlCommand): Promise<void> {
    return this.partyHostControlPort.kickPlayer(command);
  }

  leaveParty(): Promise<boolean> {
    return this.partyPlayerPort.leaveParty();
  }

  listParties(): Promise<readonly Party[]> {
    return this.partyManagementPort.listParties();
  }

  rejoinParty(command: PartyJoinCommand): Promise<PartyJoinReceipt> {
    return this.enterParty(command, true);
  }

  private async enterParty(command: PartyJoinCommand, rejoin: boolean): Promise<PartyJoinReceipt> {
    return rejoin ? this.partyPlayerPort.rejoinParty(command) : this.partyPlayerPort.joinParty(command);
  }

  submitAction(command: PartySubmitActionCommand): Promise<void> {
    return this.partyPlayerPort.submitAction(command);
  }
}
