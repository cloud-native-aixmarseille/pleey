import { describe, it, expect, beforeEach } from "vitest";
import { SubmitAnswerUseCase } from "./submit-answer.use-case";
import type { GameSocket } from "../../../domains/game/ports/game-socket";
import { createGameSocketMock } from "../../../test/mock-factories/game-socket.mock-factory";

describe("SubmitAnswerUseCase", () => {
  let submitAnswerUseCase: SubmitAnswerUseCase;
  let mockGameSocket: GameSocket;

  beforeEach(() => {
    mockGameSocket = createGameSocketMock();

    submitAnswerUseCase = new SubmitAnswerUseCase(mockGameSocket);
  });

  it("should submit answer successfully", () => {
    submitAnswerUseCase.execute({
      pin: "123456",
      userId: 1,
      answerId: 10,
      timeLeft: 15,
    });

    expect(mockGameSocket.publish).toHaveBeenCalledWith({
      type: "submit-answer",
      pin: "123456",
      userId: 1,
      answerId: 10,
      timeLeft: 15,
    });
  });

  it("should throw error when answer is empty", () => {
    expect(() =>
      submitAnswerUseCase.execute({
        pin: "123456",
        userId: 1,
        answerId: Number.NaN,
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
        answerId: Number.NaN,
        timeLeft: 15,
      }),
    ).toThrow("Answer is required");

    expect(mockGameSocket.publish).not.toHaveBeenCalled();
  });
});
