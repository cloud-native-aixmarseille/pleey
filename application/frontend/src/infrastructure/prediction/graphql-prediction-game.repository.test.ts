import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { PredictionErrorCode } from '../../domains/prediction/errors/prediction-error-code';
import { GraphqlClientMockFactory } from '../../test-utils/factories/graphql-client-mock-factory';
import { GraphqlPredictionGameRepository } from './graphql-prediction-game.repository';

describe('GraphqlPredictionGameRepository', () => {
  describe('getPredictionGamesByProject()', () => {
    it('returns normalized prediction games for the selected project', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestResult: {
          predictionGamesByProject: [
            {
              id: 8,
              predictionId: 18,
              projectId: 12,
              title: 'Winner board',
              description: null,
              createdAt: '2026-03-15T11:00:00.000Z',
            },
          ],
        },
      });
      const repository = new GraphqlPredictionGameRepository(client);

      // Act
      const games = await repository.getPredictionGamesByProject(12);

      // Assert
      expect(games).toEqual([
        {
          id: 8,
          predictionId: 18,
          projectId: 12,
          title: 'Winner board',
          description: null,
          promptCount: 0,
          createdAt: '2026-03-15T11:00:00.000Z',
        },
      ]);
    });

    it('maps transport failures to translated prediction error keys', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('prediction.errors.loadFailed'),
      });
      const repository = new GraphqlPredictionGameRepository(client);

      // Act + Assert
      await expect(repository.getPredictionGamesByProject(12)).rejects.toThrow(
        PredictionErrorCode.LOAD_FAILED,
      );
    });
  });
});
