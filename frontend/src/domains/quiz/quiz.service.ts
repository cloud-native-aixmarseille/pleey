import { Quiz, Question } from '../../shared/types';
import { apiClient, fetchClient, queryClient } from '../../shared/api/openapiClient';
import { castRequestBody } from '../../shared/api/castRequestBody';
import { API_URL } from '../../shared/config/api.config';

type QuestionType = 'multiple' | 'truefalse';

export interface CreateQuestionPayload {
  quizId: number;
  questionText: string;
  type: QuestionType;
  correctAnswer: string;
  optionA?: string | null;
  optionB?: string | null;
  optionC?: string | null;
  optionD?: string | null;
  timeLimit?: number;
  points?: number;
}

export type UpdateQuestionPayload = Partial<CreateQuestionPayload>;

interface ApiQuestionPayload {
  quiz_id: number;
  question_text: string;
  type: QuestionType;
  correct_answer: string;
  option_a?: string | null;
  option_b?: string | null;
  option_c?: string | null;
  option_d?: string | null;
  time_limit?: number;
  points?: number;
}

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
      body: castRequestBody({ title, description, organizationId }),
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

  async addQuestion(token: string, payload: CreateQuestionPayload): Promise<Question> {
    const response = await fetch(`${API_URL}/api/questions`, {
      method: 'POST',
      headers: this.buildHeaders(token),
      body: JSON.stringify(this.toApiPayload(payload)),
    });

    if (!response.ok) {
      throw await this.buildError(response, 'errors.questionCreateFailed');
    }

    const data = (await response.json()) as Question;
    return data;
  }

  async deleteQuiz(token: string, quizId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
      method: 'DELETE',
      headers: this.buildHeaders(token, false),
    });

    if (!response.ok) {
      throw await this.buildError(response, 'errors.deleteQuizFailed');
    }
  }

  async deleteQuestion(token: string, questionId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/questions/${questionId}`, {
      method: 'DELETE',
      headers: this.buildHeaders(token, false),
    });

    if (!response.ok) {
      throw await this.buildError(response, 'errors.questionDeleteFailed');
    }
  }

  async updateQuestion(
    token: string,
    questionId: number,
    payload: UpdateQuestionPayload,
  ): Promise<Question> {
    const response = await fetch(`${API_URL}/api/questions/${questionId}`, {
      method: 'PATCH',
      headers: this.buildHeaders(token),
      body: JSON.stringify(this.toApiPayload(payload)),
    });

    if (!response.ok) {
      throw await this.buildError(response, 'errors.questionUpdateFailed');
    }

    const data = (await response.json()) as Question;
    return data;
  }

  private buildHeaders(token: string, includeJson = true) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  private async buildError(response: Response, fallbackKey: string): Promise<Error> {
    try {
      const body = await response.json();
      if (body && typeof body === 'object' && 'message' in body) {
        return new Error(String(body.message));
      }
    } catch {
      // ignore JSON parse errors
    }

    return new Error(fallbackKey);
  }

  private toApiPayload(payload: CreateQuestionPayload | UpdateQuestionPayload): ApiQuestionPayload | Partial<ApiQuestionPayload> {
    const result: Partial<ApiQuestionPayload> = {};

    if ('quizId' in payload && payload.quizId !== undefined) {
      result.quiz_id = payload.quizId;
    }
    if ('questionText' in payload && payload.questionText !== undefined) {
      result.question_text = payload.questionText;
    }
    if ('type' in payload && payload.type !== undefined) {
      result.type = payload.type;
    }
    if ('correctAnswer' in payload && payload.correctAnswer !== undefined) {
      result.correct_answer = payload.correctAnswer;
    }
    if ('optionA' in payload && payload.optionA !== undefined) {
      result.option_a = payload.optionA;
    }
    if ('optionB' in payload && payload.optionB !== undefined) {
      result.option_b = payload.optionB;
    }
    if ('optionC' in payload && payload.optionC !== undefined) {
      result.option_c = payload.optionC;
    }
    if ('optionD' in payload && payload.optionD !== undefined) {
      result.option_d = payload.optionD;
    }
    if ('timeLimit' in payload && payload.timeLimit !== undefined) {
      result.time_limit = payload.timeLimit;
    }
    if ('points' in payload && payload.points !== undefined) {
      result.points = payload.points;
    }

    return result;
  }
}

export const quizService = new QuizService();
