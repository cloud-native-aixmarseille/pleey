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
    expect({ stages: result.items.map((item) => item.text), requests: requestMock.mock.calls }).toEqual({
      stages: ['First stage', 'Last stage'],
      requests: [
        [QuizManagementDocument, { quizId: fixture.gameTypeId, input: { page: 1, pageSize: 100 } }, undefined],
        [QuizManagementItemsDocument, { quizId: fixture.gameTypeId, input: { page: 2, pageSize: 1 } }, undefined],
      ],
    });
  });
});
