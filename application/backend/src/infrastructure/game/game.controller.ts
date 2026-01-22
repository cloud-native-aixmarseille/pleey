import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateGameSessionDto } from '../../application/game/dto/create-game-session.dto';
import { CreateGameSessionUseCase } from '../../application/game/use-cases/create-game-session.use-case';
import { GetActiveSessionsUseCase } from '../../application/game/use-cases/get-active-sessions.use-case';
import { GetQuizSessionsUseCase } from '../../application/game/use-cases/get-quiz-sessions.use-case';
import { ResumeGameSessionUseCase } from '../../application/game/use-cases/resume-game-session.use-case';
import { StopGameSessionUseCase } from '../../application/game/use-cases/stop-game-session.use-case';
import type { GameSessionId } from '../../domain/game/entities/game-session';
import type { QuizId } from '../../domain/quiz/entities/quiz';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sessions')
export class GameController {
  constructor(
    private readonly createGameSessionUseCase: CreateGameSessionUseCase,
    private readonly getActiveSessionsUseCase: GetActiveSessionsUseCase,
    private readonly stopGameSessionUseCase: StopGameSessionUseCase,
    private readonly resumeGameSessionUseCase: ResumeGameSessionUseCase,
    private readonly getQuizSessionsUseCase: GetQuizSessionsUseCase,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateGameSessionDto, @Request() req: AuthenticatedRequest) {
    // Override hostId from authenticated user
    const enrichedDto = { ...dto, hostId: req.user.id };
    const { session, pin } = await this.createGameSessionUseCase.execute(enrichedDto);

    return {
      pin,
      sessionId: session.id,
      quizId: session.quizId,
      hostId: session.hostId,
      status: session.status,
      currentQuestionId: session.currentQuestionId,
      createdAt: session.createdAt,
    };
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  async getActiveSessions(@Request() req: AuthenticatedRequest) {
    const sessions = await this.getActiveSessionsUseCase.execute(req.user.id);
    return {
      sessions: sessions.map((session) => ({
        sessionId: session.id,
        quizId: session.quizId,
        hostId: session.hostId,
        pin: session.pin,
        status: session.status,
        currentQuestionId: session.currentQuestionId,
        createdAt: session.createdAt,
      })),
    };
  }

  @Get('quiz/:quizId')
  @UseGuards(JwtAuthGuard)
  async getQuizSessions(
    @Param('quizId', ParseIntPipe) quizId: QuizId,
    @Request() req: AuthenticatedRequest,
  ) {
    const sessions = await this.getQuizSessionsUseCase.execute(quizId, req.user.id);
    return {
      sessions: sessions.map((session) => ({
        sessionId: session.id,
        quizId: session.quizId,
        hostId: session.hostId,
        pin: session.pin,
        status: session.status,
        currentQuestionId: session.currentQuestionId,
        createdAt: session.createdAt,
      })),
    };
  }

  @Patch(':id/stop')
  @UseGuards(JwtAuthGuard)
  async stop(@Param('id', ParseIntPipe) id: GameSessionId, @Request() req: AuthenticatedRequest) {
    const session = await this.stopGameSessionUseCase.execute(id, req.user.id);
    return {
      sessionId: session.id,
      quizId: session.quizId,
      hostId: session.hostId,
      pin: session.pin,
      status: session.status,
      currentQuestionId: session.currentQuestionId,
      createdAt: session.createdAt,
    };
  }

  @Patch(':id/resume')
  @UseGuards(JwtAuthGuard)
  async resume(@Param('id', ParseIntPipe) id: GameSessionId, @Request() req: AuthenticatedRequest) {
    const session = await this.resumeGameSessionUseCase.execute(id, req.user.id);
    return {
      sessionId: session.id,
      quizId: session.quizId,
      hostId: session.hostId,
      pin: session.pin,
      status: session.status,
      currentQuestionId: session.currentQuestionId,
      createdAt: session.createdAt,
    };
  }
}
