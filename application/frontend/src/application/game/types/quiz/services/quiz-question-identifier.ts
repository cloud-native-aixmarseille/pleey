import type { QuizQuestionId } from '../../../../../domains/game/types/quiz/entities/quiz-question-id';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

export class QuizQuestionIdentifier extends NumericIdentifierParser<QuizQuestionId> {
  constructor() {
    super('QuizQuestionId');
  }
}
