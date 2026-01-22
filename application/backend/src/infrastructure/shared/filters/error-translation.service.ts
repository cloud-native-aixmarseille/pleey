import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
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

    return code;
  }

  async translateUnknownError(): Promise<string> {
    // Prefer the game unknown error key when available.
    return this.i18n.translate('game.errors.unknownError');
  }

  private translateAuthError(code: AuthErrorCode): Promise<string> {
    const errorMap: Record<AuthErrorCode, string> = {
      [AuthErrorCode.INVALID_CREDENTIALS]: 'auth.errors.invalidCredentials',
      [AuthErrorCode.USER_ALREADY_EXISTS]: 'auth.errors.userWithEmailOrUsernameExists',
      [AuthErrorCode.PASSWORD_TOO_SHORT]: 'auth.errors.passwordTooShort',
      [AuthErrorCode.USER_NOT_FOUND]: 'auth.errors.userNotFound',
      [AuthErrorCode.UNAUTHORIZED]: 'auth.errors.unauthorized',
      [AuthErrorCode.AUTHENTICATION_REQUIRED]: 'auth.errors.authenticationRequired',
      [AuthErrorCode.ADMIN_PRIVILEGES_REQUIRED]: 'auth.errors.adminPrivilegesRequired',
      [AuthErrorCode.AVATAR_NOT_FOUND]: 'auth.errors.avatarNotFound',
      [AuthErrorCode.INVALID_REFRESH_TOKEN]: 'auth.errors.invalidRefreshToken',
      [AuthErrorCode.REFRESH_TOKEN_EXPIRED]: 'auth.errors.refreshTokenExpired',
    };

    return this.i18n.translate(errorMap[code]);
  }

  private translateQuizError(code: QuizErrorCode): Promise<string> {
    const errorMap: Record<QuizErrorCode, string> = {
      [QuizErrorCode.QUIZ_NOT_FOUND]: 'quiz.errors.quizNotFound',
      [QuizErrorCode.QUESTION_NOT_FOUND]: 'quiz.errors.questionNotFound',
      [QuizErrorCode.QUIZ_HAS_ACTIVE_SESSION]: 'quiz.errors.quizHasActiveSession',
      [QuizErrorCode.INVALID_CORRECT_ANSWER]: 'quiz.errors.invalidCorrectAnswer',
      [QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY]: 'quiz.errors.correctAnswerOptionEmpty',
    };

    return this.i18n.translate(errorMap[code]);
  }

  private translateGameError(code: GameErrorCode): Promise<string> {
    const errorMap: Partial<Record<GameErrorCode, string>> = {
      [GameErrorCode.GAME_NOT_FOUND]: 'game.errors.gameNotFound',
      [GameErrorCode.NO_QUESTIONS_AVAILABLE]: 'game.errors.noQuestionsAvailable',
      [GameErrorCode.NO_CURRENT_QUESTION_TO_RESUME]: 'game.errors.noCurrentQuestionToResume',
      [GameErrorCode.INVALID_REVEAL_DELAY]: 'game.errors.invalidRevealDelay',
      [GameErrorCode.PLAYER_IDENTITY_REQUIRED]: 'game.errors.playerIdentityRequired',
      [GameErrorCode.PLAYER_SCORE_IDENTITY_INVALID]: 'game.errors.playerScoreIdentityInvalid',
      [GameErrorCode.INVALID_PIN]: 'game.errors.invalidPin',
      [GameErrorCode.VALIDATION_FAILED]: 'game.errors.validationFailed',
      [GameErrorCode.UNKNOWN_ERROR]: 'game.errors.unknownError',
      [GameErrorCode.CAN_ONLY_PAUSE_ACTIVE_GAME]: 'game.errors.canOnlyPauseActiveGame',
      [GameErrorCode.CAN_ONLY_RESUME_PAUSED_GAME]: 'game.errors.canOnlyResumePausedGame',
      [GameErrorCode.CAN_ONLY_START_WAITING_GAME]: 'game.errors.gameCanOnlyBeStartedFromWaiting',
      [GameErrorCode.CAN_ONLY_MOVE_TO_NEXT_QUESTION_ACTIVE_GAME]:
        'game.errors.canOnlyMoveToNextInActive',
      [GameErrorCode.UNAUTHORIZED_SESSION_CONTROL]: 'game.errors.unauthorizedSessionControl',
      [GameErrorCode.ACTIVE_SESSION_EXISTS]: 'game.errors.activeSessionExists',
      [GameErrorCode.QUIZ_NOT_FOUND]: 'game.errors.quizNotFound',
      [GameErrorCode.QUIZ_SESSION_ALREADY_ACTIVE]: 'game.errors.quizSessionAlreadyActive',
      [GameErrorCode.ALREADY_ANSWERED]: 'game.errors.alreadyAnswered',
      [GameErrorCode.GAME_SESSION_ENDED]: 'game.errors.gameSessionEnded',
    };

    const translationKey = errorMap[code] ?? 'game.errors.validationFailed';
    return this.i18n.translate(translationKey);
  }
}
