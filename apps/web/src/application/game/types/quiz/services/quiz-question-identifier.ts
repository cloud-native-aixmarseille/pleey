import type { QuizQuestionId } from '@pleey/contracts/game';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

export class QuizQuestionIdentifier extends UuidV7IdentifierParser<QuizQuestionId> {
  constructor() {
    super('QuizQuestionId');
  }
}
