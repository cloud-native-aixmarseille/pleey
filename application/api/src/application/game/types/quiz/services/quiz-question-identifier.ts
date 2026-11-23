import { Injectable } from '@nestjs/common';
import type { QuizQuestionId } from '../../../../../domain/game/types/quiz/entities/quiz-question';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class QuizQuestionIdentifier extends UuidV7IdentifierParser<QuizQuestionId> {
  constructor() {
    super('QuizQuestionId');
  }
}
