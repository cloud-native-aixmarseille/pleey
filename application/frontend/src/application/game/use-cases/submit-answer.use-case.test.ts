import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubmitAnswerUseCase } from "./submit-answer.use-case";
import { IGameSocket } from "../../../domains/game/ports/game-socket.interface";

describe("SubmitAnswerUseCase", () => {
  let submitAnswerUseCase: SubmitAnswerUseCase;
  let mockGameSocket: IGameSocket;

  beforeEach(() => {
    mockGameSocket = {
      publish: vi.fn(),
    };

    submitAnswerUseCase = new SubmitAnswerUseCase(mockGameSocket);
  });

  it("should submit answer successfully", () => {
    submitAnswerUseCase.execute({
      pin: "123456",
      userId: 1,
      answer: "A",
      timeLeft: 15,
    });

    expect(mockGameSocket.publish).toHaveBeenCalledWith({
      type: "submit-answer",
      pin: "123456",
      userId: 1,
      answer: "A",
      timeLeft: 15,
    });
  });

  it("should throw error when answer is empty", () => {
    expect(() =>
      submitAnswerUseCase.execute({
        pin: "123456",
        userId: 1,
        answer: "",
        timeLeft: 15,
      }),
    ).toThrow("Answer is required");

    expect(mockGameSocket.publish).not.toHaveBeenCalled();
  });

  it("should throw error when answer is whitespace", () => {
    expect(() =>
      submitAnswerUseCase.execute({
        pin: "123456",
        userId: 1,
        answer: "   ",
        timeLeft: 15,
      }),
    ).toThrow("Answer is required");

    expect(mockGameSocket.publish).not.toHaveBeenCalled();
  });
});
