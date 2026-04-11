import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { PredictionErrorCode } from '../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import { QuizErrorCode } from '../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import { IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import { ProjectErrorCode } from '../../../domain/project/enums/project-error-code.enum';
import { GameErrorHttpStatusService } from '../../game/shared/error-handling/game-error-http-status.service';
import { PredictionErrorHttpStatusService } from '../../game/types/prediction/shared/error-handling/prediction-error-http-status.service';
import { QuizErrorHttpStatusService } from '../../game/types/quiz/shared/error-handling/quiz-error-http-status.service';
import { IdentityErrorHttpStatusService } from '../../identity/shared/error-handling/identity-error-http-status.service';
import { OrganizationErrorHttpStatusService } from '../../organization/shared/error-handling/organization-error-http-status.service';
import { ProjectErrorHttpStatusService } from '../../project/shared/error-handling/project-error-http-status.service';
import { ErrorCodeHttpStatusService } from './error-code-http-status.service';
import { ERROR_CODE_HTTP_STATUS_RESOLVERS } from './error-code-http-status-resolvers.token';

const NON_INTERNAL_ERROR_CODES = [
  ...Object.values(IdentityErrorCode),
  ...Object.values(GameErrorCode).filter((errorCode) => errorCode !== GameErrorCode.UNKNOWN_ERROR),
  ...Object.values(OrganizationErrorCode),
  ...Object.values(PredictionErrorCode),
  ...Object.values(ProjectErrorCode),
  ...Object.values(QuizErrorCode),
];

describe('ErrorCodeHttpStatusService', () => {
  it('maps every declared domain error code to a non-default HTTP status', async () => {
    const module = await Test.createTestingModule({
      providers: [
        IdentityErrorHttpStatusService,
        GameErrorHttpStatusService,
        OrganizationErrorHttpStatusService,
        PredictionErrorHttpStatusService,
        ProjectErrorHttpStatusService,
        QuizErrorHttpStatusService,
        {
          provide: ERROR_CODE_HTTP_STATUS_RESOLVERS,
          useFactory: (
            identityErrorHttpStatusService: IdentityErrorHttpStatusService,
            gameErrorHttpStatusService: GameErrorHttpStatusService,
            organizationErrorHttpStatusService: OrganizationErrorHttpStatusService,
            predictionErrorHttpStatusService: PredictionErrorHttpStatusService,
            projectErrorHttpStatusService: ProjectErrorHttpStatusService,
            quizErrorHttpStatusService: QuizErrorHttpStatusService,
          ) => [
            identityErrorHttpStatusService,
            quizErrorHttpStatusService,
            gameErrorHttpStatusService,
            organizationErrorHttpStatusService,
            predictionErrorHttpStatusService,
            projectErrorHttpStatusService,
          ],
          inject: [
            IdentityErrorHttpStatusService,
            GameErrorHttpStatusService,
            OrganizationErrorHttpStatusService,
            PredictionErrorHttpStatusService,
            ProjectErrorHttpStatusService,
            QuizErrorHttpStatusService,
          ],
        },
        ErrorCodeHttpStatusService,
      ],
    }).compile();
    const service = module.get(ErrorCodeHttpStatusService);

    for (const errorCode of NON_INTERNAL_ERROR_CODES) {
      expect(service.resolve(errorCode)).not.toBe(500);
    }

    await module.close();
  });

  it('keeps UNKNOWN_ERROR mapped to internal server error', async () => {
    const module = await Test.createTestingModule({
      providers: [
        GameErrorHttpStatusService,
        {
          provide: ERROR_CODE_HTTP_STATUS_RESOLVERS,
          useFactory: (gameErrorHttpStatusService: GameErrorHttpStatusService) => [
            gameErrorHttpStatusService,
          ],
          inject: [GameErrorHttpStatusService],
        },
        ErrorCodeHttpStatusService,
      ],
    }).compile();
    const service = module.get(ErrorCodeHttpStatusService);

    expect(service.resolve(GameErrorCode.UNKNOWN_ERROR)).toBe(500);

    await module.close();
  });
});
