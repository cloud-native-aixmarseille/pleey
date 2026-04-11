import { inject, injectable } from 'inversify';
import {
  type PartyHostControlPort,
  PartyHostControlPortToken,
} from '../../../../../domains/game/party/host/ports/party-host-control.port';
import { HostPartyRuntimeCommand } from '../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import {
  type PartyManagementPort,
  PartyManagementPortToken,
} from '../../../../../domains/game/party/host/ports/party-management.port';
import {
  type PartyGuestSessionPort,
  PartyGuestSessionPortToken,
} from '../../../../../domains/game/party/player/ports/party-guest-session.port';
import {
  type PartyJoinCommand,
  type PartyJoinReceipt,
  type PartyPlayerPort,
  PartyPlayerPortToken,
  type PartySubmitActionCommand,
} from '../../../../../domains/game/party/player/ports/party-player.port';
import type {
  Party,
  PartyId,
  PartyPin,
} from '../../../../../domains/game/party/shared/entities/party';
import type { GuestId } from '../../../../../domains/identity/entities/guest';

export interface PartyLobbyGateway {
  clearGuestId(pin: PartyPin): void;
  executeHostRuntimeCommand(command: HostPartyRuntimeCommand, partyId: PartyId): Promise<void>;
  getGuestId(pin: PartyPin): GuestId | null;
  joinParty(command: PartyJoinCommand): Promise<PartyJoinReceipt>;
  leaveParty(): Promise<boolean>;
  listParties(): Promise<readonly Party[]>;
  rejoinParty(command: PartyJoinCommand): Promise<PartyJoinReceipt>;
  setGuestId(pin: PartyPin, guestId: GuestId): void;
  submitAction(command: PartySubmitActionCommand): Promise<void>;
}

@injectable()
export class PartyLobbyFacade implements PartyLobbyGateway {
  constructor(
    @inject(PartyGuestSessionPortToken)
    private readonly partyGuestSessionPort: PartyGuestSessionPort,
    @inject(PartyHostControlPortToken)
    private readonly partyHostControlPort: PartyHostControlPort,
    @inject(PartyManagementPortToken)
    private readonly partyManagementPort: PartyManagementPort,
    @inject(PartyPlayerPortToken)
    private readonly partyPlayerPort: PartyPlayerPort,
  ) {}

  clearGuestId(pin: PartyPin): void {
    this.partyGuestSessionPort.clearGuestId(pin);
  }

  async executeHostRuntimeCommand(
    command: HostPartyRuntimeCommand,
    partyId: PartyId,
  ): Promise<void> {
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

  getGuestId(pin: PartyPin): GuestId | null {
    return this.partyGuestSessionPort.getGuestId(pin);
  }

  joinParty(command: PartyJoinCommand): Promise<PartyJoinReceipt> {
    return this.partyPlayerPort.joinParty(command);
  }

  leaveParty(): Promise<boolean> {
    return this.partyPlayerPort.leaveParty();
  }

  listParties(): Promise<readonly Party[]> {
    return this.partyManagementPort.listParties();
  }

  rejoinParty(command: PartyJoinCommand): Promise<PartyJoinReceipt> {
    return this.partyPlayerPort.rejoinParty(command);
  }

  setGuestId(pin: PartyPin, guestId: GuestId): void {
    this.partyGuestSessionPort.setGuestId(pin, guestId);
  }

  submitAction(command: PartySubmitActionCommand): Promise<void> {
    return this.partyPlayerPort.submitAction(command);
  }
}
