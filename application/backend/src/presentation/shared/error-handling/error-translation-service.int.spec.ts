import { Test, type TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { PredictionErrorCode } from '../../../domain/prediction/enums/prediction-error-code.enum';
import { ProjectErrorCode } from '../../../domain/project/enums/project-error-code.enum';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import { ErrorTranslationService } from './error-translation-service';

describe('ErrorTranslationService', () => {
  const translateMock = vi.fn((key: string) => key);
  const i18n: Pick<I18nService, 'translate'> = {
    translate: translateMock as I18nService['translate'],
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

  it('translates known error codes and falls back to common unknown error key', async () => {
    await expect(service.translateErrorCode(AuthErrorCode.INVALID_CREDENTIALS)).resolves.toBe(
      'auth.errors.invalidCredentials',
    );

    await expect(service.translateErrorCode(QuizErrorCode.QUIZ_NOT_FOUND)).resolves.toBe(
      'quiz.errors.quizNotFound',
    );

    await expect(service.translateErrorCode(GameErrorCode.GAME_NOT_FOUND)).resolves.toBe(
      'game.errors.gameNotFound',
    );

    await expect(service.translateErrorCode(GameErrorCode.GAME_SESSION_NOT_FOUND)).resolves.toBe(
      'game.errors.gameSessionNotFound',
    );

    await expect(
      service.translateErrorCode(PredictionErrorCode.PREDICTION_NOT_FOUND),
    ).resolves.toBe('prediction.errors.predictionNotFound');

    await expect(service.translateErrorCode(ProjectErrorCode.PROJECT_NOT_FOUND)).resolves.toBe(
      'project.errors.projectNotFound',
    );

    await expect(service.translateErrorCode('SOMETHING_ELSE')).resolves.toBe(
      'common.errors.unknownError',
    );

    expect(translateMock).toHaveBeenCalledWith('common.errors.unknownError', {
      args: { code: 'SOMETHING_ELSE' },
    });
  });

  it('translates unknown error using default key', async () => {
    await expect(service.translateUnknownError()).resolves.toBe('common.errors.unknownError');

    expect(translateMock).toHaveBeenCalledWith('common.errors.unknownError', {
      args: { code: 'UNKNOWN_ERROR' },
    });
  });
});
