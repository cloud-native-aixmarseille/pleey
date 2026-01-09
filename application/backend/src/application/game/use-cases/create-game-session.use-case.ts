import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { GameSession } from '../../../domain/game/entities/game-session';
import { PIN } from '../../../domain/game/entities/pin';
import { PinAlreadyInUseError } from '../../../domain/game/errors/pin-already-in-use.error';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/repositories/game-session.repository.interface';
import type { OrganizationMemberRepository } from '../../../domain/organization/repositories/organization-member.repository.interface';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/repositories/organization-member.repository.interface';
import {
  type QuizRepository,
  QuizRepositoryProvider,
} from '../../../domain/quiz/repositories/quiz.repository.interface';
import { OrganizationErrorCode } from '../../organization/enums/organization-error-code.enum';
import type { CreateGameSessionDto } from '../dto/create-game-session.dto';
import { GameErrorCode } from '../enums/game-error-code.enum';

/**
 * Create Game Session Use Case
 * Handles game session creation logic
 */
@Injectable()
export class CreateGameSessionUseCase {
  private static readonly MAX_PIN_GENERATION_ATTEMPTS = 10;

  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(dto: CreateGameSessionDto): Promise<{ session: GameSession; pin: string }> {
    // Ensure hostId is provided (should be set by controller from JWT)
    if (!dto.hostId) {
      throw new BadRequestException(GameErrorCode.VALIDATION_FAILED);
    }

    // Verify quiz exists
    const quiz = await this.quizRepository.findById(dto.quizId);
    if (!quiz) {
      throw new NotFoundException(GameErrorCode.QUIZ_NOT_FOUND);
    }

    // Verify user is a member of the quiz's organization
    const membership = await this.memberRepository.findByOrganizationAndUser(
      quiz.organizationId,
      dto.hostId,
    );
    if (!membership) {
      throw new ForbiddenException(OrganizationErrorCode.NOT_A_MEMBER);
    }

    const quizActiveSession = await this.gameSessionRepository.findActiveByQuizId(dto.quizId);

    if (quizActiveSession) {
      if (quizActiveSession.hostId !== dto.hostId) {
        throw new BadRequestException(GameErrorCode.QUIZ_SESSION_ALREADY_ACTIVE);
      }

      return {
        session: quizActiveSession,
        pin: quizActiveSession.pin,
      };
    }

    // Check for existing active sessions for this host
    const activeSessions = await this.gameSessionRepository.findActiveByHostId(dto.hostId);

    const conflictingSession = activeSessions.find((session) => session.quizId !== dto.quizId);

    if (conflictingSession) {
      throw new BadRequestException(GameErrorCode.ACTIVE_SESSION_EXISTS);
    }

    for (
      let attempt = 0;
      attempt < CreateGameSessionUseCase.MAX_PIN_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      const pin = PIN.generate();

      try {
        const session = await this.gameSessionRepository.create(
          dto.quizId,
          dto.hostId,
          quiz.organizationId,
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

    throw new BadRequestException(GameErrorCode.VALIDATION_FAILED);
  }
}
