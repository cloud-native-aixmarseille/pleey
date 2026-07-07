import { DomainError } from '../../../../shared/errors/domain-error';

enum QuizManagementRepositoryErrorCode {
  QUIZ_NOT_CREATED = 'QUIZ_NOT_CREATED',
  QUIZ_NOT_UPDATED = 'QUIZ_NOT_UPDATED',
}

const QUIZ_MANAGEMENT_REPOSITORY_ERROR_DEFINITIONS = {
  [QuizManagementRepositoryErrorCode.QUIZ_NOT_CREATED]: {
    code: QuizManagementRepositoryErrorCode.QUIZ_NOT_CREATED,
    messageKey: QuizManagementRepositoryErrorCode.QUIZ_NOT_CREATED,
  },
  [QuizManagementRepositoryErrorCode.QUIZ_NOT_UPDATED]: {
    code: QuizManagementRepositoryErrorCode.QUIZ_NOT_UPDATED,
    messageKey: QuizManagementRepositoryErrorCode.QUIZ_NOT_UPDATED,
  },
} as const;

export class QuizNotCreatedError extends DomainError<QuizManagementRepositoryErrorCode> {
  constructor(context?: Record<string, unknown>) {
    super(
      QUIZ_MANAGEMENT_REPOSITORY_ERROR_DEFINITIONS[
        QuizManagementRepositoryErrorCode.QUIZ_NOT_CREATED
      ],
      context,
    );
  }
}

export class QuizNotUpdatedError extends DomainError<QuizManagementRepositoryErrorCode> {
  constructor(context?: Record<string, unknown>) {
    super(
      QUIZ_MANAGEMENT_REPOSITORY_ERROR_DEFINITIONS[
        QuizManagementRepositoryErrorCode.QUIZ_NOT_UPDATED
      ],
      context,
    );
  }
}
