import { PartyActionIdentifier } from '../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyIdentifier } from '../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../application/game/party/shared/services/identifiers/party-pin-identifier';
import { PartyStageIdentifier } from '../application/game/party/shared/services/identifiers/party-stage-identifier';
import { GameIdentifier } from '../application/game/shared/services/identifiers/game-identifier';
import { GuestIdentifier } from '../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../application/identity/shared/services/identifiers/user-identifier';
import { OrganizationIdentifier } from '../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../application/workspace/shared/services/identifiers/organization-member-identifier';
import { ProjectIdentifier } from '../application/workspace/shared/services/identifiers/project-identifier';

class BackendTestIdentifiers {
  private readonly gameIdentifier = new GameIdentifier();

  private readonly guestIdentifier = new GuestIdentifier();

  private readonly organizationIdentifier = new OrganizationIdentifier();

  private readonly organizationMemberIdentifier = new OrganizationMemberIdentifier();

  private readonly partyActionIdentifier = new PartyActionIdentifier();

  private readonly partyIdentifier = new PartyIdentifier();

  private readonly partyPinIdentifier = new PartyPinIdentifier();

  private readonly partyStageIdentifier = new PartyStageIdentifier();

  private readonly projectIdentifier = new ProjectIdentifier();

  private readonly userIdentifier = new UserIdentifier();

  game(value: number) {
    return this.gameIdentifier.parse(value);
  }

  guest(value: string) {
    return this.guestIdentifier.parse(value);
  }

  organization(value: number) {
    return this.organizationIdentifier.parse(value);
  }

  organizationMember(value: number) {
    return this.organizationMemberIdentifier.parse(value);
  }

  partyAction(value: number) {
    return this.partyActionIdentifier.parse(value);
  }

  party(value: number) {
    return this.partyIdentifier.parse(value);
  }

  partyPin(value: string) {
    return this.partyPinIdentifier.parse(value);
  }

  partyStage(value: number) {
    return this.partyStageIdentifier.parse(value);
  }

  project(value: number) {
    return this.projectIdentifier.parse(value);
  }

  user(value: number) {
    return this.userIdentifier.parse(value);
  }
}

export const backendTestIdentifiers = new BackendTestIdentifiers();
