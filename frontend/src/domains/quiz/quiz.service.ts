import { API_URL } from '../../shared/config/api.config';
import { Quiz, Question } from '../../shared/types';

export class QuizService {
  async getQuizzes(token: string): Promise<Quiz[]> {
    const response = await fetch(`${API_URL}/api/quizzes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  }

  async createQuiz(
    token: string,
    title: string,
    description: string,
    organizationId: number
  ): Promise<Quiz> {
    const response = await fetch(`${API_URL}/api/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, organizationId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create quiz');
    }
    
    return await response.json();
  }

  async getQuestions(token: string, quizId: number): Promise<Question[]> {
    const response = await fetch(`${API_URL}/api/quizzes/${quizId}/questions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
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
