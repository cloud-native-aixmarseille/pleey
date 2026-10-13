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
  type PartyGuestSessionPort,
  PartyGuestSessionPortToken,
} from '../../../../../domains/game/party/player/ports/party-guest-session.port';
import {
  type PartyJoinCommand,
  type PartyJoinReceipt,
  PartyJoinReceiptStatus,
  type PartyPlayerPort,
  PartyPlayerPortToken,
  type PartySubmitActionCommand,
} from '../../../../../domains/game/party/player/ports/party-player.port';
import type { Party, PartyId, PartyPin } from '../../../../../domains/game/party/shared/entities/party';
import { PartyPlayerIdentityKind } from '../../../../../domains/game/party/shared/entities/party-player-identity';
import type { GuestId } from '../../../../../domains/identity/entities/guest';

export interface PartyLobbyGateway {
  clearGuestId(pin: PartyPin): void;
  executeHostRuntimeCommand(command: HostPartyRuntimeCommand, partyId: PartyId): Promise<void>;
  getGuestId(pin: PartyPin): GuestId | null;
  joinParty(command: PartyJoinCommand): Promise<PartyJoinReceipt>;
  kickPlayer(command: HostPartyPlayerControlCommand): Promise<void>;
  leaveParty(): Promise<boolean>;
  listParties(): Promise<readonly Party[]>;
  rejoinParty(command: PartyJoinCommand): Promise<PartyJoinReceipt>;
  recoverGuestParty(partyId: PartyId): Promise<void>;
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

  getGuestId(pin: PartyPin): GuestId | null {
    return this.partyGuestSessionPort.getGuestId(pin);
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

  async recoverGuestParty(partyId: PartyId): Promise<void> {
    const pin = this.partyGuestSessionPort.getGuestPin(partyId);
    const guestId = pin ? this.partyGuestSessionPort.getGuestId(pin) : null;
    if (!pin || !guestId) return;
    const receipt = await this.rejoinParty({ pin, playerIdentity: { kind: PartyPlayerIdentityKind.Guest, guestId } });
    if (receipt.status !== PartyJoinReceiptStatus.ACCEPTED) this.clearGuestId(pin);
  }

  setGuestId(pin: PartyPin, guestId: GuestId): void {
    this.partyGuestSessionPort.setGuestId(pin, guestId);
  }

  private async enterParty(command: PartyJoinCommand, rejoin: boolean): Promise<PartyJoinReceipt> {
    const guestCredential =
      command.playerIdentity.kind === PartyPlayerIdentityKind.Guest && command.playerIdentity.guestId
        ? (this.partyGuestSessionPort.getGuestCredential(command.pin) ?? undefined)
        : undefined;
    const request = { ...command, guestCredential };
    const receipt = await (rejoin
      ? this.partyPlayerPort.rejoinParty(request)
      : this.partyPlayerPort.joinParty(request));
    if (
      receipt.status === PartyJoinReceiptStatus.ACCEPTED &&
      receipt.player.identity.kind === PartyPlayerIdentityKind.Guest &&
      receipt.guestCredential
    ) {
      this.partyGuestSessionPort.setGuestId(
        receipt.pin,
        receipt.player.identity.guestId,
        receipt.guestCredential,
        receipt.partyId,
      );
    }
    return receipt;
  }

  submitAction(command: PartySubmitActionCommand): Promise<void> {
    return this.partyPlayerPort.submitAction(command);
  }
}
