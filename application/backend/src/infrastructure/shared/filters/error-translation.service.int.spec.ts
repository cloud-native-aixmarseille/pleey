import type { I18nService } from 'nestjs-i18n';
import { describe, expect, it } from 'vitest';
import { AuthErrorCode } from '../../../application/auth/enums/auth-error-code.enum';
import { GameErrorCode } from '../../../application/game/enums/game-error-code.enum';
import { QuizErrorCode } from '../../../application/quiz/enums/quiz-error-code.enum';
import { ErrorTranslationService } from './error-translation.service';

describe('ErrorTranslationService (integration)', () => {
  const i18n: Pick<I18nService, 'translate'> = {
    translate: async (key: string) => key,
  };

  it('translates known error codes and returns unknown codes verbatim', async () => {
    const service = new ErrorTranslationService(i18n as I18nService);

    await expect(service.translateErrorCode(AuthErrorCode.INVALID_CREDENTIALS)).resolves.toBe(
      'auth.errors.invalidCredentials',
    );

    await expect(service.translateErrorCode(QuizErrorCode.QUIZ_NOT_FOUND)).resolves.toBe(
      'quiz.errors.quizNotFound',
    );

    await expect(service.translateErrorCode(GameErrorCode.GAME_NOT_FOUND)).resolves.toBe(
      'game.errors.gameNotFound',
    );

    await expect(service.translateErrorCode('SOMETHING_ELSE')).resolves.toBe('SOMETHING_ELSE');
  });

  it('translates unknown error using default key', async () => {
    const service = new ErrorTranslationService(i18n as I18nService);
    await expect(service.translateUnknownError()).resolves.toBe('game.errors.unknownError');
  });
});
