import { Inject, Injectable } from '@nestjs/common';
import type { QuizQuestionId } from '../../../../../domain/game/types/quiz/entities/quiz-question';
import type { QuizQuestionRepository } from '../../../../../domain/game/types/quiz/ports/quiz-question.repository';
import { QuizQuestionRepositoryProvider } from '../../../../../domain/game/types/quiz/ports/quiz-question.repository';
import type { Media } from '../../../../../domain/media/entities/media';

@Injectable()
export class GetQuizQuestionMediaUseCase {
  constructor(
    @Inject(QuizQuestionRepositoryProvider)
    private readonly questionRepository: QuizQuestionRepository,
  ) {}

  execute(questionId: QuizQuestionId): Promise<Media | null> {
    return this.questionRepository.findMediaById(questionId);
  }
}
