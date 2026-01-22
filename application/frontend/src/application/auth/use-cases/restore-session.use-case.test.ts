import { describe, it, expect, vi, beforeEach } from "vitest";
import { RestoreSessionUseCase } from "./restore-session.use-case";
import type { Storage } from "../../../domains/shared/ports/storage";
import type { User } from "../../../domains/auth/types";
import { createUserFixture } from "../../../test/fixtures";
import { createStorageMock } from "../../../test/mock-factories/storage.mock-factory";
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "../../../domains/shared/constants/storageKeys";

describe("RestoreSessionUseCase", () => {
  let restoreSessionUseCase: RestoreSessionUseCase;
  let mockStorage: Storage;

  const mockUser: User = createUserFixture();

  beforeEach(() => {
    mockStorage = createStorageMock();

    restoreSessionUseCase = new RestoreSessionUseCase(mockStorage);
  });

  it("should restore session from storage", () => {
    vi.mocked(mockStorage.getItem).mockImplementation((key: string) => {
      if (key === TOKEN_STORAGE_KEY) return "test-token";
      if (key === USER_STORAGE_KEY) return JSON.stringify(mockUser);
      return null;
    });

    const result = restoreSessionUseCase.execute();

    expect(result).toEqual({
      token: "test-token",
      user: mockUser,
    });
  });

  it("should return null when token is missing", () => {
    vi.mocked(mockStorage.getItem).mockReturnValue(null);

    const result = restoreSessionUseCase.execute();

    expect(result).toBeNull();
  });

  it("should return null when user is missing", () => {
    vi.mocked(mockStorage.getItem).mockImplementation((key: string) => {
      if (key === TOKEN_STORAGE_KEY) return "test-token";
      return null;
    });

    const result = restoreSessionUseCase.execute();

    expect(result).toBeNull();
  });

  it("should clear storage and return null on invalid JSON", () => {
    vi.mocked(mockStorage.getItem).mockImplementation((key: string) => {
      if (key === TOKEN_STORAGE_KEY) return "test-token";
      if (key === USER_STORAGE_KEY) return "invalid-json";
      return null;
    });

    const result = restoreSessionUseCase.execute();

    expect(result).toBeNull();
    expect(mockStorage.removeItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(USER_STORAGE_KEY);
  });
});

