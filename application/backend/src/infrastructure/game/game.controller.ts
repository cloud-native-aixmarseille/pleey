import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGameSessionDto } from '../../application/game/dto/create-game-session.dto';
import { CreateGameSessionUseCase } from '../../application/game/use-cases/create-game-session.use-case';
import { StopGameSessionUseCase } from '../../application/game/use-cases/stop-game-session.use-case';
import { ResumeGameSessionUseCase } from '../../application/game/use-cases/resume-game-session.use-case';
import { GetActiveSessionsUseCase } from '../../application/game/use-cases/get-active-sessions.use-case';
import { GetQuizSessionsUseCase } from '../../application/game/use-cases/get-quiz-sessions.use-case';

@Controller('sessions')
export class GameController {
  constructor(
    private readonly createGameSessionUseCase: CreateGameSessionUseCase,
    private readonly stopGameSessionUseCase: StopGameSessionUseCase,
    private readonly resumeGameSessionUseCase: ResumeGameSessionUseCase,
    private readonly getActiveSessionsUseCase: GetActiveSessionsUseCase,
    private readonly getQuizSessionsUseCase: GetQuizSessionsUseCase,
  ) { }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateGameSessionDto, @Request() req: any) {
    // Override adminId from authenticated user
    const enrichedDto = { ...dto, adminId: req.user.id };
    const { session, pin } = await this.createGameSessionUseCase.execute(enrichedDto);

    return {
      pin,
      sessionId: session.id,
      quizId: session.quizId,
      adminId: session.adminId,
      status: session.status,
      currentQuestion: session.currentQuestion,
      createdAt: session.createdAt,
    };
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  async getActiveSessions(@Request() req: any) {
    const sessions = await this.getActiveSessionsUseCase.execute(req.user.id);
    return {
      sessions: sessions.map(session => ({
        sessionId: session.id,
        quizId: session.quizId,
        adminId: session.adminId,
        pin: session.pin,
        status: session.status,
        currentQuestion: session.currentQuestion,
        createdAt: session.createdAt,
      })),
    };
  }

  @Get('quiz/:quizId')
  @UseGuards(JwtAuthGuard)
  async getQuizSessions(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Request() req: any,
  ) {
    const sessions = await this.getQuizSessionsUseCase.execute(quizId, req.user.id);
    return {
      sessions: sessions.map((session) => ({
        sessionId: session.id,
        quizId: session.quizId,
        adminId: session.adminId,
        pin: session.pin,
        status: session.status,
        currentQuestion: session.currentQuestion,
        createdAt: session.createdAt,
      })),
    };
  }

  @Patch(':id/stop')
  @UseGuards(JwtAuthGuard)
  async stop(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const session = await this.stopGameSessionUseCase.execute(id, req.user.id);
    return {
      sessionId: session.id,
      quizId: session.quizId,
      adminId: session.adminId,
      pin: session.pin,
      status: session.status,
      currentQuestion: session.currentQuestion,
      createdAt: session.createdAt,
    };
  }

  @Patch(':id/resume')
  @UseGuards(JwtAuthGuard)
  async resume(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const session = await this.resumeGameSessionUseCase.execute(id, req.user.id);
    return {
      sessionId: session.id,
      quizId: session.quizId,
      adminId: session.adminId,
      pin: session.pin,
      status: session.status,
      currentQuestion: session.currentQuestion,
      createdAt: session.createdAt,
    };
  }
}
