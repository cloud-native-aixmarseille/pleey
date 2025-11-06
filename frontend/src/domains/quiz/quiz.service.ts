import { Quiz, Question } from '../../shared/types';
import { apiClient, fetchClient, queryClient } from '../../shared/api/openapiClient';
import { API_URL } from '../../shared/config/api.config';

export class QuizService {
  async getQuizzes(token: string): Promise<Quiz[]> {
    if (!token) {
      return [];
    }

    const result = await queryClient.fetchQuery(
      apiClient.queryOptions('get', '/api/quizzes'),
    );

    if (!result) {
      return [];
    }

    return result as Quiz[];
  }

  async createQuiz(
    token: string,
    title: string,
    description: string,
    organizationId: number
  ): Promise<Quiz> {
    const { data, error } = await fetchClient.POST('/api/quizzes', {
      body: { title, description, organizationId } as any,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (error || !data) {
      throw new Error('errors.createQuizFailed');
    }

    const createdQuiz = data as Quiz;
    await queryClient.invalidateQueries({ queryKey: ['get', '/api/quizzes'] });

    return createdQuiz;
  }

  async getQuestions(token: string, quizId: number): Promise<Question[]> {
    if (!token) {
      return [];
    }

    const result = await queryClient.fetchQuery(
      apiClient.queryOptions('get', '/api/quizzes/{quizId}/questions', {
        params: {
          path: {
            quizId,
          },
        },
      }),
    );

    if (!result) {
      return [];
    }

    return result as Question[];
  }

  async addQuestion(token: string, questionData: Partial<Question>): Promise<void> {
    await fetch(`${API_URL}/api/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(questionData)
    });
  }

  async deleteQuiz(token: string, quizId: number): Promise<void> {
    await fetch(`${API_URL}/api/quizzes/${quizId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  async deleteQuestion(token: string, questionId: number): Promise<void> {
    await fetch(`${API_URL}/api/questions/${questionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}

export const quizService = new QuizService();
