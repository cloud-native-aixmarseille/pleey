import { Inject, Injectable } from '@nestjs/common';
import type { GameSession, GameSessionPin } from '../../../../domain/game/entities/game-session';
import { PIN } from '../../../../domain/game/entities/pin';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { PinAlreadyInUseError } from '../../../../domain/game/errors/pin-already-in-use-error';
import {
  type GameRepository,
  GameRepositoryProvider,
} from '../../../../domain/game/ports/repositories/game.repository';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../../domain/game/ports/repositories/game-session.repository';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import { ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';
import type { CreateGameSessionDto } from '../dto/create-game-session-dto';

@Injectable()
export class CreateHostSessionUseCase {
  private static readonly MAX_PIN_GENERATION_ATTEMPTS = 10;

  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(dto: CreateGameSessionDto): Promise<{ session: GameSession; pin: GameSessionPin }> {
    if (!dto.hostId) {
      throw new Error(GameErrorCode.VALIDATION_FAILED);
    }

    const game = await this.gameRepository.findById(dto.gameId);
    if (!game) {
      throw new Error(GameErrorCode.GAME_NOT_FOUND);
    }

    const project = await this.projectRepository.findById(game.projectId);
    if (!project) {
      throw new Error(ProjectErrorCode.PROJECT_NOT_FOUND);
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      project.organizationId,
      dto.hostId,
    );
    if (!membership) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }

    const gameActiveSession = await this.gameSessionRepository.findActiveByGameId(dto.gameId);

    if (gameActiveSession) {
      if (gameActiveSession.hostId !== dto.hostId) {
        throw new Error(GameErrorCode.GAME_ALREADY_HAS_ACTIVE_SESSION);
      }

      throw new Error(GameErrorCode.ACTIVE_SESSION_EXISTS);
    }

    const activeSessions = await this.gameSessionRepository.findActiveByHostId(dto.hostId);
    const conflictingSession = activeSessions.find((session) => session.gameId !== dto.gameId);

    if (conflictingSession) {
      throw new Error(GameErrorCode.ACTIVE_SESSION_EXISTS);
    }

    for (
      let attempt = 0;
      attempt < CreateHostSessionUseCase.MAX_PIN_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      const pin = PIN.generate();

      try {
        const session = await this.gameSessionRepository.create(
          dto.gameId,
          dto.hostId,
          pin.getValue(),
        );

        return {
          session,
          pin: pin.getValue(),
        };
      } catch (error) {
        if (error instanceof PinAlreadyInUseError) {
          continue;
        }

        throw error;
      }
    }

    throw new Error(GameErrorCode.VALIDATION_FAILED);
  }
}
