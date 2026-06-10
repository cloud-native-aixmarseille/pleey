import { randomInt } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PinAlreadyInUseError } from '../../../../../domain/game/party/errors/pin-already-in-use.error';
import type { PartyPin } from '../../../../../domain/game/party/shared/entities/party';
import type { PartySummary } from '../../../../../domain/game/party/shared/entities/party-summary';
import { PasswordService } from '../../../../../domain/identity/services/password-service';
import { OrganizationErrorCode } from '../../../../../domain/organization/enums/organization-error-code.enum';
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
    private readonly partyPinIdentifier: PartyPinIdentifier,
    @Inject(PasswordService)
    private readonly passwordService: Pick<PasswordService, 'hash' | 'isValidPassword'>,
  ) {}

  async execute(input: CreatePartyDto): Promise<PartySummary> {
    const managedGame = await this.partyManagement.findManagedGame(input.gameId);
    if (!managedGame) {
      throw new Error(GameErrorCode.GAME_NOT_FOUND);
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      managedGame.organizationId,
      input.hostUserId,
    );
    if (!membership) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
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
      throw new Error(GameErrorCode.VALIDATION_FAILED);
    }

    const privatePartyPasswordHash =
      privatePartyPassword && privatePartyPassword.length > 0
        ? await this.passwordService.hash(privatePartyPassword)
        : undefined;

    for (let attempt = 0; attempt < CreatePartyUseCase.MAX_PIN_GENERATION_ATTEMPTS; attempt += 1) {
      try {
        const party = await this.partyManagement.createParty({
          gameId: input.gameId,
          hostUserId: input.hostUserId,
          pin: this.generatePin(),
          privatePartyPasswordHash,
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

    throw new Error(GameErrorCode.VALIDATION_FAILED);
  }

  private generatePin(): PartyPin {
    return this.partyPinIdentifier.parse(String(randomInt(100000, 1_000_000)));
  }
}
