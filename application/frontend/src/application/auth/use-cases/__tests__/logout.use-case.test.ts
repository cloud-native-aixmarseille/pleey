import { describe, it, expect, vi, beforeEach } from "vitest";
import { LogoutUseCase } from "../logout.use-case";
import { IStorage } from "../../../shared/ports/storage.interface";

describe("LogoutUseCase", () => {
  let logoutUseCase: LogoutUseCase;
  let mockStorage: IStorage;

  beforeEach(() => {
    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    logoutUseCase = new LogoutUseCase(mockStorage);
  });

  it("should remove token and user from storage", () => {
    logoutUseCase.execute();

    expect(mockStorage.removeItem).toHaveBeenCalledWith("quizmaster_token");
    expect(mockStorage.removeItem).toHaveBeenCalledWith("quizmaster_user");
  });

  it("should call removeItem exactly twice", () => {
    logoutUseCase.execute();

    expect(mockStorage.removeItem).toHaveBeenCalledTimes(2);
  });
});
