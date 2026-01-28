import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { QuizQuestionType } from '../../domains/quiz/entities/quiz-question';
import { QuizErrorCode } from '../../domains/quiz/errors/quiz-error-code';
import { GraphqlClientMockFactory } from '../../test-utils/factories/graphql-client-mock-factory';
import { GraphqlQuizRepository } from './graphql-quiz.repository';

describe('GraphqlQuizRepository', () => {
  describe('getQuizById()', () => {
    it('returns the matching quiz when it is accessible outside the current project filter', async () => {
      const { client } = new GraphqlClientMockFactory().create({
        requestResult: {
          quizzes: [
            {
              id: 5,
              gameId: 10,
              title: 'Warmup',
              description: null,
              createdAt: '2026-03-01T10:00:00.000Z',
              questionCount: 3,
            },
            {
              id: 7,
              gameId: 17,
              title: 'Town hall',
              description: 'Monthly knowledge check',
              createdAt: '2026-03-15T10:00:00.000Z',
              questionCount: 9,
            },
          ],
        },
      });
      const repository = new GraphqlQuizRepository(client);

      const quiz = await repository.getQuizById(7);

      expect(quiz).toEqual({
        id: 7,
        gameId: 17,
        title: 'Town hall',
        description: 'Monthly knowledge check',
        createdAt: '2026-03-15T10:00:00.000Z',
        questionCount: 9,
      });
    });
  });

  describe('getQuizzesByProject()', () => {
    it('returns normalized quizzes for the selected project', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestResult: {
          quizzes: [
            {
              id: 7,
              gameId: 17,
              title: 'Town hall',
              description: 'Monthly knowledge check',
              createdAt: '2026-03-15T10:00:00.000Z',
              questionCount: 9,
            },
          ],
        },
      });
      const repository = new GraphqlQuizRepository(client);

      // Act
      const quizzes = await repository.getQuizzesByProject(12);

      // Assert
      expect(quizzes).toEqual([
        {
          id: 7,
          gameId: 17,
          title: 'Town hall',
          description: 'Monthly knowledge check',
          createdAt: '2026-03-15T10:00:00.000Z',
          questionCount: 9,
        },
      ]);
    });

    it('maps transport failures to translated quiz error keys', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('quiz.errors.loadFailed'),
      });
      const repository = new GraphqlQuizRepository(client);

      // Act + Assert
      await expect(repository.getQuizzesByProject(12)).rejects.toThrow(QuizErrorCode.LOAD_FAILED);
    });
  });

  describe('getQuizQuestions()', () => {
    it('returns normalized quiz questions', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestResult: {
          quizQuestions: [
            {
              id: 4,
              quizId: 7,
              position: 1,
              questionText: 'How many players can join?',
              type: 'MULTIPLE',
              answers: [
                { id: 11, text: '4', position: 1, isCorrect: false },
                { id: 12, text: 'Unlimited', position: 2, isCorrect: true },
              ],
              timeLimit: 20,
              points: 150,
            },
          ],
        },
      });
      const repository = new GraphqlQuizRepository(client);

      // Act
      const questions = await repository.getQuizQuestions(7);

      // Assert
      expect(questions).toEqual([
        {
          id: 4,
          quizId: 7,
          position: 1,
          questionText: 'How many players can join?',
          type: QuizQuestionType.MULTIPLE,
          answers: [
            { id: 11, text: '4', position: 1, isCorrect: false },
            { id: 12, text: 'Unlimited', position: 2, isCorrect: true },
          ],
          timeLimit: 20,
          points: 150,
        },
      ]);
    });
  });
});
