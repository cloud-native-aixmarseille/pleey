import { vi } from "vitest";
import { createContainerMock } from "./container.mock-factory";

const { quizRepositoryMock } = vi.hoisted(() => ({
  quizRepositoryMock: {
    getQuizzes: vi.fn(),
    addQuestion: vi.fn(),
    deleteQuestion: vi.fn(),
  },
}));

vi.mock("../../app/di/container", async () => {
  return {
    container: createContainerMock({
      quizRepository: {
        ...quizRepositoryMock,
      },
    }),
  };
});

export { quizRepositoryMock };

export const resetQuizManagerMocks = () => {
  quizRepositoryMock.getQuizzes.mockClear();
  quizRepositoryMock.addQuestion.mockClear();
  quizRepositoryMock.deleteQuestion.mockClear();
};
