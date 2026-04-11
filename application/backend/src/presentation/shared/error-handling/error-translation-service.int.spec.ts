import 'reflect-metadata';
import { Test, type TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { PredictionErrorCode } from '../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import { QuizErrorCode } from '../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import { IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import { ProjectErrorCode } from '../../../domain/project/enums/project-error-code.enum';
import { GameErrorTranslationService } from '../../game/shared/error-handling/game-error-translation.service';
import { PredictionErrorTranslationService } from '../../game/types/prediction/shared/error-handling/prediction-error-translation.service';
import { QuizErrorTranslationService } from '../../game/types/quiz/shared/error-handling/quiz-error-translation.service';
import { IdentityErrorTranslationService } from '../../identity/shared/error-handling/identity-error-translation.service';
import { OrganizationErrorTranslationService } from '../../organization/shared/error-handling/organization-error-translation.service';
import { ProjectErrorTranslationService } from '../../project/shared/error-handling/project-error-translation.service';
import { ERROR_CODE_TRANSLATORS } from './error-code-translators.token';
import { ErrorTranslationService } from './error-translation-service';

const KNOWN_ERROR_CODES = [
  ...Object.values(IdentityErrorCode),
  ...Object.values(GameErrorCode),
  ...Object.values(OrganizationErrorCode),
  ...Object.values(PredictionErrorCode),
  ...Object.values(ProjectErrorCode),
  ...Object.values(QuizErrorCode),
];

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
        IdentityErrorTranslationService,
        GameErrorTranslationService,
        OrganizationErrorTranslationService,
        PredictionErrorTranslationService,
        ProjectErrorTranslationService,
        QuizErrorTranslationService,
        {
          provide: ERROR_CODE_TRANSLATORS,
          useFactory: (
            identityErrorTranslationService: IdentityErrorTranslationService,
            gameErrorTranslationService: GameErrorTranslationService,
            organizationErrorTranslationService: OrganizationErrorTranslationService,
            predictionErrorTranslationService: PredictionErrorTranslationService,
            projectErrorTranslationService: ProjectErrorTranslationService,
            quizErrorTranslationService: QuizErrorTranslationService,
          ) => [
            identityErrorTranslationService,
            quizErrorTranslationService,
            gameErrorTranslationService,
            organizationErrorTranslationService,
            predictionErrorTranslationService,
            projectErrorTranslationService,
          ],
          inject: [
            IdentityErrorTranslationService,
            GameErrorTranslationService,
            OrganizationErrorTranslationService,
            PredictionErrorTranslationService,
            ProjectErrorTranslationService,
            QuizErrorTranslationService,
          ],
        },
        {
          provide: ErrorTranslationService,
          useFactory: (
            i18nService: I18nService,
            translators: readonly [
              IdentityErrorTranslationService,
              QuizErrorTranslationService,
              GameErrorTranslationService,
              OrganizationErrorTranslationService,
              PredictionErrorTranslationService,
              ProjectErrorTranslationService,
            ],
          ) => new ErrorTranslationService(i18nService, translators),
          inject: [I18nService, ERROR_CODE_TRANSLATORS],
        },
      ],
    }).compile();

    service = module.get(ErrorTranslationService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('translates known error codes and falls back to common unknown error key', async () => {
    await expect(service.translateErrorCode(IdentityErrorCode.INVALID_CREDENTIALS)).resolves.toBe(
      'auth.errors.invalidCredentials',
    );

    await expect(service.translateErrorCode(QuizErrorCode.QUIZ_NOT_FOUND)).resolves.toBe(
      'quiz.errors.quizNotFound',
    );

    await expect(service.translateErrorCode(GameErrorCode.GAME_NOT_FOUND)).resolves.toBe(
      'game.errors.gameNotFound',
    );

    await expect(service.translateErrorCode(GameErrorCode.PIN_ALREADY_IN_USE)).resolves.toBe(
      'game.errors.pinAlreadyInUse',
    );

    await expect(
      service.translateErrorCode(GameErrorCode.HOST_ALREADY_HAS_ACTIVE_PARTY_FOR_GAME),
    ).resolves.toBe('game.errors.hostAlreadyHasActivePartyForGame');

    await expect(
      service.translateErrorCode(PredictionErrorCode.PREDICTION_NOT_FOUND),
    ).resolves.toBe('prediction.errors.predictionNotFound');

    await expect(
      service.translateErrorCode(OrganizationErrorCode.ORGANIZATION_NOT_FOUND),
    ).resolves.toBe('organization.errors.organizationNotFound');

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

  it('translates every declared error code without falling back to unknown', async () => {
    for (const errorCode of KNOWN_ERROR_CODES) {
      await expect(service.translateErrorCode(errorCode)).resolves.not.toBe(
        'common.errors.unknownError',
      );
    }
  });
});
