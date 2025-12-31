import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { GameSession } from '../../../domain/game/entities/game-session.entity';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/repositories/game-session.repository.interface';
import { PIN } from '../../../domain/game/value-objects/pin.vo';
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
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(dto: CreateGameSessionDto): Promise<{ session: GameSession; pin: string }> {
    // Ensure adminId is provided (should be set by controller from JWT)
    if (!dto.adminId) {
      throw new BadRequestException('Admin ID is required');
    }

    // Verify quiz exists
    const quiz = await this.quizRepository.findById(dto.quizId);
    if (!quiz) {
      throw new NotFoundException(GameErrorCode.QUIZ_NOT_FOUND);
    }

    // Verify user is a member of the quiz's organization
    const membership = await this.memberRepository.findByOrganizationAndUser(
      quiz.organizationId,
      dto.adminId,
    );
    if (!membership) {
      throw new ForbiddenException(OrganizationErrorCode.NOT_A_MEMBER);
    }

    const quizActiveSession = await this.gameSessionRepository.findActiveByQuizId(dto.quizId);

    if (quizActiveSession) {
      if (quizActiveSession.adminId !== dto.adminId) {
        throw new BadRequestException(GameErrorCode.QUIZ_SESSION_ALREADY_ACTIVE);
      }

      return {
        session: quizActiveSession,
        pin: quizActiveSession.pin,
      };
    }

    // Check for existing active sessions for this admin
    const activeSessions = await this.gameSessionRepository.findActiveByAdminId(dto.adminId);

    const conflictingSession = activeSessions.find((session) => session.quizId !== dto.quizId);

    if (conflictingSession) {
      throw new BadRequestException(GameErrorCode.ACTIVE_SESSION_EXISTS);
    }

    // Generate unique PIN
    const pin = PIN.generate();

    // Create session with the quiz's organization
    const session = await this.gameSessionRepository.create(
      dto.quizId,
      dto.adminId,
      quiz.organizationId,
      pin.getValue(),
    );

    return {
      session,
      pin: pin.getValue(),
    };
  }
}
