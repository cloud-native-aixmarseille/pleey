import { describe, expect, it } from 'vitest';
import { QuizManagementRoutesFactory } from './quiz-management-routes-factory';

describe('QuizManagementRoutesFactory', () => {
  it('registers the quiz management route', () => {
    const routes = new QuizManagementRoutesFactory({} as never, {} as never).create();

    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('quizzes/:quizId');
    expect(routes[0].element).toBeTruthy();
  });
});
