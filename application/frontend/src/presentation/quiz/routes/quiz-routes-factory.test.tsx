import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { QuizManagementFacade } from '../../../application/quiz-management/facades/quiz-management.facade';
import { DashboardReadGatewayMockFactory } from '../../../test-utils/factories/dashboard-read-gateway-mock-factory';
import { QuizRoutesFactory } from './quiz-routes-factory';

vi.mock('react-i18next', async () => {
  const { ReactI18nextMockFactory } = await import(
    'src/test-utils/factories/react-i18next-mock-factory'
  );

  return new ReactI18nextMockFactory().createModule();
});

describe('QuizRoutesFactory', () => {
  const dashboardReadGatewayMockFactory = new DashboardReadGatewayMockFactory();

  it('registers only the quiz management route', () => {
    // Arrange
    const factory = new QuizRoutesFactory(
      {
        createQuestion: vi.fn(),
        deleteQuestion: vi.fn(),
        loadManagementData: vi.fn(),
        updateQuestion: vi.fn(),
        updateQuiz: vi.fn(),
      } as unknown as QuizManagementFacade,
      dashboardReadGatewayMockFactory.create(),
    );

    // Act
    const routes = factory.create();

    // Assert
    expect(routes.some((route) => route.path === 'quizzes/:quizId')).toBe(true);
    expect(routes).toHaveLength(1);
  });
});
