import { describe, it, expect, vi, beforeEach } from "vitest";
import { LogoutUseCase } from "./logout.use-case";
import type { Storage } from "../../../domains/shared/ports/storage";
import { createStorageMock } from "../../../test/mock-factories/storage.mock-factory";

describe("LogoutUseCase", () => {
  let logoutUseCase: LogoutUseCase;
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = createStorageMock();

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
