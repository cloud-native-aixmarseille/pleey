import { createHash } from 'node:crypto';
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
import type { MediaId } from '../domain/media/entities/media';

class BackendTestIdentifiers {
  private toUuidV7(value: number | string): string {
    const seed = createHash('sha256').update(String(value)).digest('hex').slice(0, 32);

    return `${seed.slice(0, 8)}-${seed.slice(8, 12)}-7${seed.slice(13, 16)}-8${seed.slice(17, 20)}-${seed.slice(20, 32)}`;
  }

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

  game(value: number | string) {
    return this.gameIdentifier.parse(this.toUuidV7(value));
  }

  guest(value: number | string) {
    return this.guestIdentifier.parse(this.toUuidV7(value));
  }

  media(value: number | string): MediaId {
    return this.toUuidV7(value) as MediaId;
  }

  organization(value: number | string) {
    return this.organizationIdentifier.parse(this.toUuidV7(value));
  }

  organizationMember(value: number | string) {
    return this.organizationMemberIdentifier.parse(this.toUuidV7(value));
  }

  partyAction(value: number | string) {
    return this.partyActionIdentifier.parse(this.toUuidV7(value));
  }

  party(value: number | string) {
    return this.partyIdentifier.parse(this.toUuidV7(value));
  }

  partyPin(value: string) {
    return this.partyPinIdentifier.parse(value);
  }

  partyStage(value: number | string) {
    return this.partyStageIdentifier.parse(this.toUuidV7(value));
  }

  project(value: number | string) {
    return this.projectIdentifier.parse(this.toUuidV7(value));
  }

  user(value: number | string) {
    return this.userIdentifier.parse(this.toUuidV7(value));
  }
}

export const backendTestIdentifiers = new BackendTestIdentifiers();
