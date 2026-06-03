import type { QuizQuestionId } from '../../../../../domains/game/types/quiz/entities/quiz-question-id';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

export class QuizQuestionIdentifier extends UuidV7IdentifierParser<QuizQuestionId> {
  constructor() {
    super('QuizQuestionId');
  }
}
