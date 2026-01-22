import { describe, it, expect, vi, beforeEach } from "vitest";
import { LogoutUseCase } from "./logout.use-case";
import type { Storage } from "../../../domains/shared/ports/storage";
import { createStorageMock } from "../../../test/mock-factories/storage.mock-factory";
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "../../../domains/shared/constants/storageKeys";

describe("LogoutUseCase", () => {
  let logoutUseCase: LogoutUseCase;
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = createStorageMock();

    logoutUseCase = new LogoutUseCase(mockStorage);
  });

  it("should remove token and user from storage", () => {
    logoutUseCase.execute();

    expect(mockStorage.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(USER_STORAGE_KEY);
  });

  it("should call removeItem exactly twice", () => {
    logoutUseCase.execute();

    expect(mockStorage.removeItem).toHaveBeenCalledTimes(2);
  });
});
