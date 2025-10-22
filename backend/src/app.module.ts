import { Module } from '@nestjs/common';
import { AuthModule } from './infrastructure/auth';
import { GameModule } from './infrastructure/game';
import { QuizModule } from './infrastructure/quiz/quiz.module';
import { HealthModule } from './infrastructure/health';

@Module({
  imports: [HealthModule, AuthModule, QuizModule, GameModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
