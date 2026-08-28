import { randomInt } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { GameNotFoundError } from '../../../../../domain/game/errors';
import {
  InvalidPrivatePartyPasswordError,
  PartyPinGenerationFailedError,
} from '../../../../../domain/game/party/errors/create-party.error';
import { PinAlreadyInUseError } from '../../../../../domain/game/party/errors/pin-already-in-use.error';
import type { PartyPin } from '../../../../../domain/game/party/shared/entities/party';
import type { PartySummary } from '../../../../../domain/game/party/shared/entities/party-summary';
import { PartySettingsResolver } from '../../../../../domain/game/party/shared/services/party-settings-resolver';
import { PasswordService } from '../../../../../domain/identity/services/password-service';
import { NotAMemberError } from '../../../../../domain/organization/errors';
import type { OrganizationMemberRepository } from '../../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../../domain/organization/ports/organization-member.repository';
import { GamePermissionResolver } from '../../../../game/management/services/game-permission-resolver';
import type { CreatePartyDto } from '../../shared/dto/create-party.dto';
import { PartyManagementPort } from '../../shared/ports/party-management.port';
import { PartyPinIdentifier } from '../../shared/services/identifiers/party-pin-identifier';
import { BroadcastPartyObservationUseCase } from '../../shared/use-cases/broadcast-party-observation-use-case';

@Injectable()
export class CreatePartyUseCase {
  private static readonly MAX_PIN_GENERATION_ATTEMPTS = 10;

  constructor(
    @Inject(PartyManagementPort)
    private readonly partyManagement: PartyManagementPort,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
    private readonly gamePermissionResolver: GamePermissionResolver,
    private readonly broadcastPartyObservationUseCase: BroadcastPartyObservationUseCase,
    private readonly partySettingsResolver: PartySettingsResolver,
    private readonly partyPinIdentifier: PartyPinIdentifier,
    @Inject(PasswordService)
    private readonly passwordService: Pick<PasswordService, 'hash' | 'isValidPassword'>,
  ) {}

  async execute(input: CreatePartyDto): Promise<PartySummary> {
    const managedGame = await this.partyManagement.findManagedGame(input.gameId);
    if (!managedGame) {
      throw new GameNotFoundError({ gameId: input.gameId });
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      managedGame.organizationId,
      input.hostUserId,
    );
    if (!membership) {
      throw new NotAMemberError({
        gameId: input.gameId,
        organizationId: managedGame.organizationId,
        userId: input.hostUserId,
      });
    }

    await this.gamePermissionResolver.assertCanCreateParty({
      gameId: input.gameId,
      hostUserId: input.hostUserId,
    });

    const privatePartyPassword = input.privatePartyPassword?.trim();

    if (
      privatePartyPassword !== undefined &&
      privatePartyPassword.length > 0 &&
      !this.passwordService.isValidPassword(privatePartyPassword)
    ) {
      throw new InvalidPrivatePartyPasswordError({
        gameId: input.gameId,
        hostUserId: input.hostUserId,
        privatePartyPasswordLength: privatePartyPassword.length,
      });
    }

    const privatePartyPasswordHash =
      privatePartyPassword && privatePartyPassword.length > 0
        ? await this.passwordService.hash(privatePartyPassword)
        : undefined;
    const settings = this.partySettingsResolver.resolve({
      organizationDefaultSettings: managedGame.organizationDefaultSettings,
      projectDefaultSettings: managedGame.projectDefaultSettings,
      settingsOverride: input.settingsOverride,
    });

    for (let attempt = 0; attempt < CreatePartyUseCase.MAX_PIN_GENERATION_ATTEMPTS; attempt += 1) {
      try {
        const party = await this.partyManagement.createParty({
          gameId: input.gameId,
          hostUserId: input.hostUserId,
          pin: this.generatePin(),
          privatePartyPasswordHash,
          settings,
        });

        await this.broadcastPartyObservationUseCase.broadcastIfPresent({
          partyId: party.partyId,
        });

        return party;
      } catch (error) {
        if (error instanceof PinAlreadyInUseError) {
          continue;
        }

        throw error;
      }
    }

    throw new PartyPinGenerationFailedError({
      attempts: CreatePartyUseCase.MAX_PIN_GENERATION_ATTEMPTS,
      gameId: input.gameId,
      hostUserId: input.hostUserId,
    });
  }

  private generatePin(): PartyPin {
    return this.partyPinIdentifier.parse(String(randomInt(100000, 1_000_000)));
  }
}
