import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddQuestionUseCase } from "./add-question.use-case";
import { IQuizRepository } from "../../../domains/quiz/ports/quiz.repository.interface";
import type { Question } from "../../../domains/quiz/types";
import { createQuestionFixture } from "../../../test/fixtures";

describe("AddQuestionUseCase", () => {
  let addQuestionUseCase: AddQuestionUseCase;
  let mockQuizRepository: IQuizRepository;

  const mockQuestion: Question = createQuestionFixture();

  beforeEach(() => {
    mockQuizRepository = {
      getQuizzes: vi.fn(),
      getQuestions: vi.fn(),
      createQuiz: vi.fn(),
      addQuestion: vi.fn(),
    };

    addQuestionUseCase = new AddQuestionUseCase(mockQuizRepository);
  });

  it("should add question successfully", async () => {
    vi.mocked(mockQuizRepository.addQuestion).mockResolvedValue(mockQuestion);

    const questionData: Partial<Question> = {
      quiz_id: 1,
      question_text: "What is 2+2?",
    };

    const result = await addQuestionUseCase.execute({
      token: "test-token",
      questionData,
    });

    expect(result).toEqual(mockQuestion);
    expect(mockQuizRepository.addQuestion).toHaveBeenCalledWith(
      "test-token",
      questionData,
    );
  });

  it("should throw error when question text is empty", async () => {
    await expect(
      addQuestionUseCase.execute({
        token: "test-token",
        questionData: {
          quiz_id: 1,
          question_text: "",
        },
      }),
    ).rejects.toThrow("Question text is required");

    expect(mockQuizRepository.addQuestion).not.toHaveBeenCalled();
  });

  it("should throw error when question text is whitespace", async () => {
    await expect(
      addQuestionUseCase.execute({
        token: "test-token",
        questionData: {
          quiz_id: 1,
          question_text: "   ",
        },
      }),
    ).rejects.toThrow("Question text is required");

    expect(mockQuizRepository.addQuestion).not.toHaveBeenCalled();
  });

  it("should throw error when quiz_id is missing", async () => {
    await expect(
      addQuestionUseCase.execute({
        token: "test-token",
        questionData: {
          question_text: "What is 2+2?",
        },
      }),
    ).rejects.toThrow("Quiz ID is required");

    expect(mockQuizRepository.addQuestion).not.toHaveBeenCalled();
  });
});

