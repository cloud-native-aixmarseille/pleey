import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { PredictionErrorCode } from '../../../domain/prediction/enums/prediction-error-code.enum';
import { ProjectErrorCode } from '../../../domain/project/enums/project-error-code.enum';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';

@Injectable()
export class ErrorTranslationService {
  constructor(private readonly i18n: I18nService) {}

  async translateErrorCode(code: string): Promise<string> {
    if (Object.values(AuthErrorCode).includes(code as AuthErrorCode)) {
      return this.translateAuthError(code as AuthErrorCode);
    }

    if (Object.values(QuizErrorCode).includes(code as QuizErrorCode)) {
      return this.translateQuizError(code as QuizErrorCode);
    }

    if (Object.values(GameErrorCode).includes(code as GameErrorCode)) {
      return this.translateGameError(code as GameErrorCode);
    }

    if (Object.values(PredictionErrorCode).includes(code as PredictionErrorCode)) {
      return this.translatePredictionError(code as PredictionErrorCode);
    }

    if (Object.values(ProjectErrorCode).includes(code as ProjectErrorCode)) {
      return this.translateProjectError(code as ProjectErrorCode);
    }

    return this.translateUnknownError(code);
  }

  async translateUnknownError(code: string | null = null): Promise<string> {
    const resolvedCode = code ?? 'UNKNOWN_ERROR';
    return this.i18n.translate('common.errors.unknownError', {
      args: { code: resolvedCode },
    });
  }

  private translateAuthError(code: AuthErrorCode): Promise<string> {
    switch (code) {
      case AuthErrorCode.INVALID_CREDENTIALS:
        return this.i18n.translate('auth.errors.invalidCredentials');
      case AuthErrorCode.USER_ALREADY_EXISTS:
        return this.i18n.translate('auth.errors.userWithEmailOrUsernameExists');
      case AuthErrorCode.PASSWORD_TOO_SHORT:
        return this.i18n.translate('auth.errors.passwordTooShort');
      case AuthErrorCode.USER_NOT_FOUND:
        return this.i18n.translate('auth.errors.userNotFound');
      case AuthErrorCode.UNAUTHORIZED:
        return this.i18n.translate('auth.errors.unauthorized');
      case AuthErrorCode.AUTHENTICATION_REQUIRED:
        return this.i18n.translate('auth.errors.authenticationRequired');
      case AuthErrorCode.AVATAR_NOT_FOUND:
        return this.i18n.translate('auth.errors.avatarNotFound');
      case AuthErrorCode.INVALID_REFRESH_TOKEN:
        return this.i18n.translate('auth.errors.invalidRefreshToken');
      case AuthErrorCode.REFRESH_TOKEN_EXPIRED:
        return this.i18n.translate('auth.errors.refreshTokenExpired');
    }
  }

  private translateQuizError(code: QuizErrorCode): Promise<string> {
    switch (code) {
      case QuizErrorCode.QUIZ_NOT_FOUND:
        return this.i18n.translate('quiz.errors.quizNotFound');
      case QuizErrorCode.QUESTION_NOT_FOUND:
        return this.i18n.translate('quiz.errors.questionNotFound');
      case QuizErrorCode.QUIZ_HAS_ACTIVE_SESSION:
        return this.i18n.translate('quiz.errors.quizHasActiveSession');
      case QuizErrorCode.INVALID_CORRECT_ANSWER:
        return this.i18n.translate('quiz.errors.invalidCorrectAnswer');
      case QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY:
        return this.i18n.translate('quiz.errors.correctAnswerOptionEmpty');
    }
  }

  private translateGameError(code: GameErrorCode): Promise<string> {
    switch (code) {
      case GameErrorCode.GAME_NOT_FOUND:
        return this.i18n.translate('game.errors.gameNotFound');
      case GameErrorCode.GAME_SESSION_NOT_FOUND:
        return this.i18n.translate('game.errors.gameSessionNotFound');
      case GameErrorCode.NO_STAGES_AVAILABLE:
        return this.i18n.translate('game.errors.noStagesAvailable');
      case GameErrorCode.NO_CURRENT_STAGE_TO_RESUME:
        return this.i18n.translate('game.errors.noCurrentStageToResume');
      case GameErrorCode.INVALID_REVEAL_DELAY:
        return this.i18n.translate('game.errors.invalidRevealDelay');
      case GameErrorCode.PLAYER_IDENTITY_REQUIRED:
        return this.i18n.translate('game.errors.playerIdentityRequired');
      case GameErrorCode.PLAYER_SCORE_IDENTITY_INVALID:
        return this.i18n.translate('game.errors.playerScoreIdentityInvalid');
      case GameErrorCode.INVALID_PIN:
        return this.i18n.translate('game.errors.invalidPin');
      case GameErrorCode.VALIDATION_FAILED:
        return this.i18n.translate('game.errors.validationFailed');
      case GameErrorCode.UNKNOWN_ERROR:
        return this.i18n.translate('game.errors.unknownError');
      case GameErrorCode.CAN_ONLY_PAUSE_ACTIVE_GAME:
        return this.i18n.translate('game.errors.canOnlyPauseActiveGame');
      case GameErrorCode.CAN_ONLY_RESUME_PAUSED_GAME:
        return this.i18n.translate('game.errors.canOnlyResumePausedGame');
      case GameErrorCode.CAN_ONLY_START_WAITING_GAME:
        return this.i18n.translate('game.errors.gameCanOnlyBeStartedFromWaiting');
      case GameErrorCode.CAN_ONLY_MOVE_TO_NEXT_STAGE_ACTIVE_GAME:
        return this.i18n.translate('game.errors.canOnlyMoveToNextStageInActive');
      case GameErrorCode.UNAUTHORIZED_SESSION_CONTROL:
        return this.i18n.translate('game.errors.unauthorizedSessionControl');
      case GameErrorCode.ACTIVE_SESSION_EXISTS:
        return this.i18n.translate('game.errors.activeSessionExists');
      case GameErrorCode.GAME_ALREADY_HAS_ACTIVE_SESSION:
        return this.i18n.translate('game.errors.gameAlreadyHasActiveSession');
      case GameErrorCode.ALREADY_ACTED:
        return this.i18n.translate('game.errors.alreadyActed');
      case GameErrorCode.GAME_SESSION_ENDED:
        return this.i18n.translate('game.errors.gameSessionEnded');
      case GameErrorCode.GAME_TYPE_NOT_SUPPORTED:
        return this.i18n.translate('game.errors.gameTypeNotSupported');
    }
  }

  private translatePredictionError(code: PredictionErrorCode): Promise<string> {
    switch (code) {
      case PredictionErrorCode.PREDICTION_NOT_FOUND:
        return this.i18n.translate('prediction.errors.predictionNotFound');
      case PredictionErrorCode.PROMPT_NOT_FOUND:
        return this.i18n.translate('prediction.errors.promptNotFound');
      case PredictionErrorCode.INVALID_CORRECT_OPTION:
        return this.i18n.translate('prediction.errors.invalidCorrectOption');
      case PredictionErrorCode.OPTION_TEXT_EMPTY:
        return this.i18n.translate('prediction.errors.optionTextEmpty');
    }
  }

  private translateProjectError(code: ProjectErrorCode): Promise<string> {
    switch (code) {
      case ProjectErrorCode.CANNOT_DELETE_LAST_PROJECT:
        return this.i18n.translate('project.errors.cannotDeleteLastProject');
      case ProjectErrorCode.PROJECT_MIGRATION_TARGET_INVALID:
        return this.i18n.translate('project.errors.migrationTargetInvalid');
      case ProjectErrorCode.PROJECT_MIGRATION_TARGET_NOT_FOUND:
        return this.i18n.translate('project.errors.migrationTargetNotFound');
      case ProjectErrorCode.PROJECT_MIGRATION_TARGET_REQUIRED:
        return this.i18n.translate('project.errors.migrationTargetRequired');
      case ProjectErrorCode.PROJECT_NOT_FOUND:
        return this.i18n.translate('project.errors.projectNotFound');
    }
  }
}
