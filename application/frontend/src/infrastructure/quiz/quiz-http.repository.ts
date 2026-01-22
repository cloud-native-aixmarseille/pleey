import { QuizRepository } from "../../domains/quiz/ports/quiz.repository";
import type { Quiz, Question } from "../../domains/quiz/types";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
  UpdateQuizPayload,
} from "../../domains/quiz/quiz.payloads";
import {
  apiClient,
  fetchClient,
  queryClient,
} from "../shared/http/api/openapiClient";
import { castRequestBody } from "../shared/http/api/castRequestBody";
import { API_URL } from "../../app/config/api.config";

/**
 * HTTP implementation of Quiz Repository
 * Handles API communication for quiz operations
 * Following Repository Pattern and Single Responsibility Principle
 */
export class QuizHttpRepository implements QuizRepository {
  async getQuizzes(
    token: string,
    options?: {
      force?: boolean;
    },
  ): Promise<Quiz[]> {
    if (!token) {
      return [];
    }

    if (options?.force) {
      await queryClient.invalidateQueries({ queryKey: ["get", "/api/quizzes"] });
    }

    const result = await queryClient.fetchQuery(
      apiClient.queryOptions("get", "/api/quizzes"),
    );

    if (!result) {
      return [];
    }

    return result as Quiz[];
  }

  async getQuestions(token: string, quizId: number): Promise<Question[]> {
    if (!token) {
      return [];
    }

    const result = await queryClient.fetchQuery(
      apiClient.queryOptions("get", "/api/quizzes/{quizId}/questions", {
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

  async createQuiz(
    token: string,
    title: string,
    description: string,
    organizationId: number,
  ): Promise<Quiz> {
    const { data, error } = await fetchClient.POST("/api/quizzes", {
      body: castRequestBody({ title, description, organizationId }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (error || !data) {
      throw new Error("errors.createQuizFailed");
    }

    const createdQuiz = data as Quiz;
    await queryClient.invalidateQueries({ queryKey: ["get", "/api/quizzes"] });

    return createdQuiz;
  }

  async addQuestion(
    token: string,
    questionData: CreateQuestionPayload,
  ): Promise<Question> {
    const response = await fetch(`${API_URL}/api/questions`, {
      method: "POST",
      headers: this.buildHeaders(token),
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      throw await this.buildError(response, "errors.questionCreateFailed");
    }

    const data = (await response.json()) as Question;

    await queryClient.invalidateQueries({ queryKey: ["get", "/api/quizzes"] });

    return data;
  }

  async updateQuiz(
    token: string,
    quizId: number,
    payload: UpdateQuizPayload,
  ): Promise<Quiz> {
    const response = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
      method: "PATCH",
      headers: this.buildHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw await this.buildError(response, "errors.quizUpdateFailed");
    }

    const data = (await response.json()) as Quiz;
    await queryClient.invalidateQueries({ queryKey: ["get", "/api/quizzes"] });
    return data;
  }

  async deleteQuiz(token: string, quizId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
      method: "DELETE",
      headers: this.buildHeaders(token, false),
    });

    if (!response.ok) {
      throw await this.buildError(response, "errors.deleteQuizFailed");
    }

    await queryClient.invalidateQueries({ queryKey: ["get", "/api/quizzes"] });
  }

  async deleteQuestion(token: string, questionId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/questions/${questionId}`, {
      method: "DELETE",
      headers: this.buildHeaders(token, false),
    });

    if (!response.ok) {
      throw await this.buildError(response, "errors.questionDeleteFailed");
    }

    await queryClient.invalidateQueries({ queryKey: ["get", "/api/quizzes"] });
  }

  async updateQuestion(
    token: string,
    questionId: number,
    payload: UpdateQuestionPayload,
  ): Promise<Question> {
    const response = await fetch(`${API_URL}/api/questions/${questionId}`, {
      method: "PATCH",
      headers: this.buildHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw await this.buildError(response, "errors.questionUpdateFailed");
    }

    const data = (await response.json()) as Question;

    await queryClient.invalidateQueries({ queryKey: ["get", "/api/quizzes"] });

    return data;
  }

  private buildHeaders(token: string, includeJson = true) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  private async buildError(
    response: Response,
    fallbackKey: string,
  ): Promise<Error> {
    try {
      const body = await response.json();
      if (body && typeof body === "object" && "message" in body) {
        return new Error(String(body.message));
      }
    } catch {
      // ignore JSON parse errors
    }

    return new Error(fallbackKey);
  }
}

