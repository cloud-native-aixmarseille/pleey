import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import { PredictionErrorCode } from '../../../domain/prediction/enums/prediction-error-code.enum';
import { ProjectErrorCode } from '../../../domain/project/enums/project-error-code.enum';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';

const ERROR_CODE_HTTP_STATUS: Record<
  | AuthErrorCode
  | GameErrorCode
  | OrganizationErrorCode
  | PredictionErrorCode
  | ProjectErrorCode
  | QuizErrorCode,
  number
> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: 401,
  [AuthErrorCode.USER_ALREADY_EXISTS]: 409,
  [AuthErrorCode.PASSWORD_TOO_SHORT]: 400,
  [AuthErrorCode.USER_NOT_FOUND]: 404,
  [AuthErrorCode.UNAUTHORIZED]: 401,
  [AuthErrorCode.AUTHENTICATION_REQUIRED]: 401,
  [AuthErrorCode.AVATAR_NOT_FOUND]: 404,
  [AuthErrorCode.INVALID_REFRESH_TOKEN]: 401,
  [AuthErrorCode.REFRESH_TOKEN_EXPIRED]: 401,

  [GameErrorCode.GAME_NOT_FOUND]: 404,
  [GameErrorCode.GAME_SESSION_NOT_FOUND]: 404,
  [GameErrorCode.NO_STAGES_AVAILABLE]: 400,
  [GameErrorCode.NO_CURRENT_STAGE_TO_RESUME]: 400,
  [GameErrorCode.INVALID_REVEAL_DELAY]: 400,
  [GameErrorCode.PLAYER_IDENTITY_REQUIRED]: 400,
  [GameErrorCode.PLAYER_SCORE_IDENTITY_INVALID]: 400,
  [GameErrorCode.INVALID_PIN]: 400,
  [GameErrorCode.VALIDATION_FAILED]: 400,
  [GameErrorCode.UNKNOWN_ERROR]: 500,
  [GameErrorCode.CAN_ONLY_PAUSE_ACTIVE_GAME]: 400,
  [GameErrorCode.CAN_ONLY_RESUME_PAUSED_GAME]: 400,
  [GameErrorCode.CAN_ONLY_START_WAITING_GAME]: 400,
  [GameErrorCode.CAN_ONLY_MOVE_TO_NEXT_STAGE_ACTIVE_GAME]: 400,
  [GameErrorCode.UNAUTHORIZED_SESSION_CONTROL]: 403,
  [GameErrorCode.ACTIVE_SESSION_EXISTS]: 400,
  [GameErrorCode.GAME_ALREADY_HAS_ACTIVE_SESSION]: 400,
  [GameErrorCode.ALREADY_ACTED]: 400,
  [GameErrorCode.GAME_SESSION_ENDED]: 400,
  [GameErrorCode.GAME_TYPE_NOT_SUPPORTED]: 400,

  [OrganizationErrorCode.ORGANIZATION_NOT_FOUND]: 404,
  [OrganizationErrorCode.ORGANIZATION_NAME_ALREADY_EXISTS]: 409,
  [OrganizationErrorCode.MEMBER_NOT_FOUND]: 404,
  [OrganizationErrorCode.MEMBER_ALREADY_EXISTS]: 409,
  [OrganizationErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER]: 400,
  [OrganizationErrorCode.NOT_A_MEMBER]: 403,

  [PredictionErrorCode.PREDICTION_NOT_FOUND]: 404,
  [PredictionErrorCode.PROMPT_NOT_FOUND]: 404,
  [PredictionErrorCode.INVALID_CORRECT_OPTION]: 400,
  [PredictionErrorCode.OPTION_TEXT_EMPTY]: 400,

  [ProjectErrorCode.CANNOT_DELETE_LAST_PROJECT]: 400,
  [ProjectErrorCode.PROJECT_MIGRATION_TARGET_INVALID]: 400,
  [ProjectErrorCode.PROJECT_MIGRATION_TARGET_NOT_FOUND]: 404,
  [ProjectErrorCode.PROJECT_MIGRATION_TARGET_REQUIRED]: 400,
  [ProjectErrorCode.PROJECT_NOT_FOUND]: 404,

  [QuizErrorCode.QUIZ_NOT_FOUND]: 404,
  [QuizErrorCode.QUESTION_NOT_FOUND]: 404,
  [QuizErrorCode.QUIZ_HAS_ACTIVE_SESSION]: 409,
  [QuizErrorCode.INVALID_CORRECT_ANSWER]: 400,
  [QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY]: 400,
};

export function resolveHttpStatusFromErrorCode(
  errorCode:
    | AuthErrorCode
    | GameErrorCode
    | OrganizationErrorCode
    | PredictionErrorCode
    | ProjectErrorCode
    | QuizErrorCode
    | string,
): number {
  return (
    ERROR_CODE_HTTP_STATUS[
      errorCode as
        | AuthErrorCode
        | GameErrorCode
        | OrganizationErrorCode
        | PredictionErrorCode
        | ProjectErrorCode
        | QuizErrorCode
    ] ?? 500
  );
}
