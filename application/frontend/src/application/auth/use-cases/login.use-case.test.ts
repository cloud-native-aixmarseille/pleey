import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginUseCase } from "./login.use-case";
import { IAuthRepository } from "../../../domains/auth/ports/auth.repository.interface";
import { IStorage } from "../../../domains/shared/ports/storage.interface";
import {
  createAuthResponsePayloadFixture,
} from "../../../test/fixtures";

describe("LoginUseCase", () => {
  let loginUseCase: LoginUseCase;
  let mockAuthRepository: IAuthRepository;
  let mockStorage: IStorage;

  beforeEach(() => {
    mockAuthRepository = {
      login: vi.fn(),
      register: vi.fn(),
      getCurrentUser: vi.fn(),
      updateProfile: vi.fn(),
      regenerateAvatar: vi.fn(),
      logout: vi.fn(),
    };

    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    loginUseCase = new LoginUseCase(mockAuthRepository, mockStorage);
  });

  it("should login successfully and store credentials", async () => {
    const mockResponse = createAuthResponsePayloadFixture();
    vi.mocked(mockAuthRepository.login).mockResolvedValue(mockResponse);

    const result = await loginUseCase.execute({
      email: "test@example.com",
      password: "password123",
    });

    expect(result).toEqual({ token: mockResponse.token, user: mockResponse.user });
    expect(mockAuthRepository.login).toHaveBeenCalledWith(
      "test@example.com",
      "password123",
    );
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      "quizmaster_token",
      mockResponse.token,
    );
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      "quizmaster_user",
      JSON.stringify(mockResponse.user),
    );
  });

  it("should throw error when login fails", async () => {
    vi.mocked(mockAuthRepository.login).mockRejectedValue(
      new Error("Invalid credentials"),
    );

    await expect(
      loginUseCase.execute({
        email: "test@example.com",
        password: "wrong-password",
      }),
    ).rejects.toThrow("Invalid credentials");

    expect(mockStorage.setItem).not.toHaveBeenCalled();
  });
});

