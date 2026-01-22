import { Test, type TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import { ErrorTranslationService } from './error-translation.service';

describe('ErrorTranslationService (integration)', () => {
  const i18n: Pick<I18nService, 'translate'> = {
    translate: ((key: string) => key) as I18nService['translate'],
  };

  let module: TestingModule;
  let service: ErrorTranslationService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        { provide: I18nService, useValue: i18n },
        {
          provide: ErrorTranslationService,
          useFactory: (i18nService: I18nService) => new ErrorTranslationService(i18nService),
          inject: [I18nService],
        },
      ],
    }).compile();

    service = module.get(ErrorTranslationService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('translates known error codes and returns unknown codes verbatim', async () => {
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
    await expect(service.translateUnknownError()).resolves.toBe('game.errors.unknownError');
  });
});
