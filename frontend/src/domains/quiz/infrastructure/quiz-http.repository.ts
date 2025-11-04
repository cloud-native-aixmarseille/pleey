import { IQuizRepository } from '../ports/quiz.repository.interface';
import { Quiz, Question } from '../../../shared/types';
import { API_URL } from '../../../shared/config/api.config';

/**
 * HTTP implementation of Quiz Repository
 * Handles API communication for quiz operations
 * Following Repository Pattern and Single Responsibility Principle
 */
export class QuizHttpRepository implements IQuizRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  async getQuizzes(token: string): Promise<Quiz[]> {
    const response = await fetch(`${this.baseUrl}/api/quiz`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }

    return response.json();
  }

  async getQuestions(token: string, quizId: number): Promise<Question[]> {
    const response = await fetch(`${this.baseUrl}/api/quiz/${quizId}/questions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch questions for quiz ${quizId}`);
    }

    return response.json();
  }

  async createQuiz(token: string, title: string, description: string): Promise<Quiz> {
    const response = await fetch(`${this.baseUrl}/api/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
      throw new Error('Failed to create quiz');
    }

    return response.json();
  }

  async addQuestion(token: string, questionData: Partial<Question>): Promise<Question> {
    const response = await fetch(`${this.baseUrl}/api/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      throw new Error('Failed to add question');
    }

    return response.json();
  }
}
