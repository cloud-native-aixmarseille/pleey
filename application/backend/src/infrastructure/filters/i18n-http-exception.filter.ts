import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from '@nestjs/common';
import type { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AuthErrorCode } from '../../application/auth/enums/auth-error-code.enum';
import { GameErrorCode } from '../../application/game/enums/game-error-code.enum';
import { QuizErrorCode } from '../../application/quiz/enums/quiz-error-code.enum';

/**
 * HTTP Exception Filter with i18n support
 * Translates error codes to localized messages
 */
@Catch(HttpException)
export class I18nHttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;

    // Check if the message is an error code enum
    if (typeof exceptionResponse === 'string') {
      message = await this.translateErrorCode(exceptionResponse);
    } else if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const msgValue = (exceptionResponse as { message?: unknown }).message;
      if (typeof msgValue === 'string') {
        message = await this.translateErrorCode(msgValue);
      } else if (Array.isArray(msgValue)) {
        message = msgValue.join(', ');
      } else {
        message = await this.translateErrorCode('UNKNOWN_ERROR');
      }
    } else {
      message = await this.i18n.translate('common.errors.unknownError');
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private async translateErrorCode(code: string): Promise<string> {
    // Check if it's an auth error code
    if (Object.values(AuthErrorCode).includes(code as AuthErrorCode)) {
      return this.translateAuthError(code as AuthErrorCode);
    }

    // Check if it's a quiz error code
    if (Object.values(QuizErrorCode).includes(code as QuizErrorCode)) {
      return this.translateQuizError(code as QuizErrorCode);
    }

    if (Object.values(GameErrorCode).includes(code as GameErrorCode)) {
      return this.translateGameError(code as GameErrorCode);
    }

    // If it's not an error code, return as is (might be a validation message)
    return code;
  }

  private async translateAuthError(code: AuthErrorCode): Promise<string> {
    const errorMap: Record<AuthErrorCode, string> = {
      [AuthErrorCode.INVALID_CREDENTIALS]: 'auth.errors.invalidCredentials',
      [AuthErrorCode.USER_ALREADY_EXISTS]: 'auth.errors.userWithEmailOrUsernameExists',
      [AuthErrorCode.PASSWORD_TOO_SHORT]: 'auth.errors.passwordTooShort',
      [AuthErrorCode.USER_NOT_FOUND]: 'auth.errors.userNotFound',
      [AuthErrorCode.UNAUTHORIZED]: 'auth.errors.unauthorized',
      [AuthErrorCode.AVATAR_NOT_FOUND]: 'auth.errors.avatarNotFound',
      [AuthErrorCode.INVALID_REFRESH_TOKEN]: 'auth.errors.invalidRefreshToken',
      [AuthErrorCode.REFRESH_TOKEN_EXPIRED]: 'auth.errors.refreshTokenExpired',
    };

    return this.i18n.translate(errorMap[code]);
  }

  private async translateQuizError(code: QuizErrorCode): Promise<string> {
    const errorMap: Record<QuizErrorCode, string> = {
      [QuizErrorCode.QUIZ_NOT_FOUND]: 'quiz.errors.quizNotFound',
      [QuizErrorCode.QUESTION_NOT_FOUND]: 'quiz.errors.questionNotFound',
      [QuizErrorCode.AUTHENTICATION_REQUIRED]: 'quiz.errors.authenticationRequired',
      [QuizErrorCode.ADMIN_PRIVILEGES_REQUIRED]: 'quiz.errors.adminPrivilegesRequired',
      [QuizErrorCode.QUIZ_HAS_ACTIVE_SESSION]: 'quiz.errors.quizHasActiveSession',
      [QuizErrorCode.INVALID_CORRECT_ANSWER]: 'quiz.errors.invalidCorrectAnswer',
      [QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY]: 'quiz.errors.correctAnswerOptionEmpty',
    };

    return this.i18n.translate(errorMap[code]);
  }

  private async translateGameError(code: GameErrorCode): Promise<string> {
    const errorMap: Partial<Record<GameErrorCode, string>> = {
      [GameErrorCode.GAME_NOT_FOUND]: 'game.errors.gameNotFound',
      [GameErrorCode.NO_QUESTIONS_AVAILABLE]: 'game.errors.noQuestionsAvailable',
      [GameErrorCode.VALIDATION_FAILED]: 'game.errors.validationFailed',
      [GameErrorCode.CAN_ONLY_PAUSE_ACTIVE_GAME]: 'game.errors.canOnlyPauseActiveGame',
      [GameErrorCode.CAN_ONLY_RESUME_PAUSED_GAME]: 'game.errors.canOnlyResumePausedGame',
      [GameErrorCode.UNAUTHORIZED_SESSION_CONTROL]: 'game.errors.unauthorizedSessionControl',
      [GameErrorCode.QUIZ_NOT_FOUND]: 'game.errors.quizNotFound',
      [GameErrorCode.ACTIVE_SESSION_EXISTS]: 'game.errors.activeSessionExists',
      [GameErrorCode.QUIZ_SESSION_ALREADY_ACTIVE]: 'game.errors.quizSessionAlreadyActive',
    };

    const translationKey = errorMap[code] ?? 'game.errors.validationFailed';
    return this.i18n.translate(translationKey);
  }
}
