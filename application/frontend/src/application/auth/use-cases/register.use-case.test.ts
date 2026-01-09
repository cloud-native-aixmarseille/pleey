import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterUseCase } from "./register.use-case";
import { IAuthRepository } from "../../../domains/auth/ports/auth.repository.interface";

describe("RegisterUseCase", () => {
  let registerUseCase: RegisterUseCase;
  let mockAuthRepository: IAuthRepository;

  beforeEach(() => {
    mockAuthRepository = {
      login: vi.fn(),
      register: vi.fn(),
      getCurrentUser: vi.fn(),
      updateProfile: vi.fn(),
      regenerateAvatar: vi.fn(),
      logout: vi.fn(),
    };

    registerUseCase = new RegisterUseCase(mockAuthRepository);
  });

  it("should register successfully", async () => {
    vi.mocked(mockAuthRepository.register).mockResolvedValue();

    await registerUseCase.execute({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    expect(mockAuthRepository.register).toHaveBeenCalledWith(
      "testuser",
      "test@example.com",
      "password123",
    );
  });

  it("should throw error when registration fails", async () => {
    vi.mocked(mockAuthRepository.register).mockRejectedValue(
      new Error("Email already exists"),
    );

    await expect(
      registerUseCase.execute({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      }),
    ).rejects.toThrow("Email already exists");
  });
});
