import { describe, expect, it } from 'vitest';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { QuizQuestionIdentifier } from '../../../../application/game/types/quiz/services/quiz-question-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { PlayableManagementPageFixtureFactory } from '../../../../test-utils/fixtures/playable-management-page-fixture-factory';
import { GraphqlClientMockFactory } from '../../../../test-utils/mocks/graphql-client-mock-factory';
import { QuizManagementDocument, QuizManagementItemsDocument } from '../../../graphql/generated/graphql';
import { PlayableManagementGraphqlMapper } from '../shared/playable-management-graphql.mapper';
import { GraphqlQuizManagementRepository } from './graphql-quiz-management.repository';

describe('GraphqlQuizManagementRepository', () => {
  it('loads every stage through bounded pages and fetches metadata only once', async () => {
    // Arrange
    const fixture = new PlayableManagementPageFixtureFactory().create('quiz');
    if (!('quizQuestions' in fixture.firstResponse)) {
      throw new Error('Expected quiz questions response');
    }
    const quizQuestions = fixture.firstResponse.quizQuestions;

    quizQuestions.items[0].media = {
      mimeType: 'image/png',
      uri: '/api/quiz-questions/3/media?v=1',
    };
    const { client, requestMock } = new GraphqlClientMockFactory().create();
    requestMock.mockResolvedValueOnce(fixture.firstResponse).mockResolvedValueOnce(fixture.nextResponse);
    const identifier = new GameTypeIdentifier();
    const repository = new GraphqlQuizManagementRepository(
      client,
      new GameIdentifier(),
      identifier,
      new QuizQuestionIdentifier(),
      new PlayableManagementGraphqlMapper(),
    );
    // Act
    const result = await repository.load(identifier.parse(fixture.gameTypeId));
    // Assert
    expect({
      mediaUris: result.items.map((item) => item.media?.uri ?? null),
      requests: requestMock.mock.calls,
      stages: result.items.map((item) => item.text),
    }).toEqual({
      mediaUris: ['/api/quiz-questions/3/media?v=1', null],
      stages: ['First stage', 'Last stage'],
      requests: [
        [QuizManagementDocument, { quizId: fixture.gameTypeId, input: { page: 1, pageSize: 100 } }, undefined],
        [QuizManagementItemsDocument, { quizId: fixture.gameTypeId, input: { page: 2, pageSize: 1 } }, undefined],
      ],
    });
  });
});
