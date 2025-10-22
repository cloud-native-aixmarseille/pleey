import { Body, Controller, Post } from '@nestjs/common';
import { CreateGameSessionDto } from '../../application/game/dto/create-game-session.dto';
import { CreateGameSessionUseCase } from '../../application/game/use-cases/create-game-session.use-case';

@Controller('sessions')
export class GameController {
  constructor(private readonly createGameSessionUseCase: CreateGameSessionUseCase) { }

  @Post('create')
  async create(@Body() dto: CreateGameSessionDto) {
    const { session, pin } = await this.createGameSessionUseCase.execute(dto);

    return {
      pin,
      sessionId: session.id,
      quizId: session.quizId,
      status: session.status,
      currentQuestion: session.currentQuestion,
      createdAt: session.createdAt,
    };
  }
}
