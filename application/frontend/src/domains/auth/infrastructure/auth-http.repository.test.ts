import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthHttpRepository } from "./auth-http.repository";
import { fetchClient } from "../../../infrastructure/http/api/openapiClient";

type PostResult = Awaited<ReturnType<typeof fetchClient.POST>>;

const createPostResult = (overrides: Partial<PostResult>): PostResult => ({
  data: undefined,
  error: undefined,
  response: new Response(),
  ...overrides,
});

describe("AuthHttpRepository", () => {
  let repository: AuthHttpRepository;

  beforeEach(() => {
    repository = new AuthHttpRepository();
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should login successfully", async () => {
      const mockResponse = {
        token: "legacy-token",
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
        expiresIn: 3600,
        user: {
          id: 1,
          username: "testuser",
          email: "test@example.com",
          isAdmin: false,
        },
      };

      const postSpy = vi.spyOn(fetchClient, "POST");
      postSpy.mockResolvedValueOnce(createPostResult({ data: mockResponse }));

      const result = await repository.login("test@example.com", "password123");

      expect(result).toEqual({
        token: "test-access-token",
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
        expiresIn: 3600,
        user: mockResponse.user,
      });
      expect(postSpy).toHaveBeenCalledWith(
        "/api/login",
        expect.objectContaining({
          body: { email: "test@example.com", password: "password123" },
        }),
      );
    });

    it("should throw error on invalid credentials", async () => {
      const postSpy = vi.spyOn(fetchClient, "POST");
      postSpy.mockResolvedValueOnce(
        createPostResult({
          data: undefined,
          error: new Error("Invalid credentials"),
        }),
      );

      await expect(
        repository.login("test@example.com", "wrong-password"),
      ).rejects.toThrow("auth.errors.invalidCredentials");
    });

    it("should throw error on invalid response structure", async () => {
      const postSpy = vi.spyOn(fetchClient, "POST");
      postSpy.mockResolvedValueOnce(
        createPostResult({ data: { token: "test-token" } as never }),
      );

      await expect(
        repository.login("test@example.com", "password123"),
      ).rejects.toThrow("auth.errors.invalidResponse");
    });
  });

  describe("register", () => {
    it("should register successfully", async () => {
      const postSpy = vi.spyOn(fetchClient, "POST");
      postSpy.mockResolvedValueOnce(createPostResult({ data: undefined }));

      await repository.register("testuser", "test@example.com", "password123");

      expect(postSpy).toHaveBeenCalledWith(
        "/api/register",
        expect.objectContaining({
          body: {
            username: "testuser",
            email: "test@example.com",
            password: "password123",
          },
        }),
      );
    });

    it("should throw error on registration failure", async () => {
      const postSpy = vi.spyOn(fetchClient, "POST");
      postSpy.mockResolvedValueOnce(
        createPostResult({
          data: undefined,
          error: new Error("Email already exists"),
        }),
      );

      await expect(
        repository.register("testuser", "test@example.com", "password123"),
      ).rejects.toThrow("auth.errors.userAlreadyExists");
    });
  });

  describe("regenerateAvatar", () => {
    it("should regenerate avatar successfully", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        isAdmin: false,
        avatarUrl: "/api/avatars/users/1?v=fingerprint",
      };

      const postSpy = vi.spyOn(fetchClient, "POST");
      postSpy.mockResolvedValueOnce(createPostResult({ data: mockUser }));

      const result = await repository.regenerateAvatar();

      expect(postSpy).toHaveBeenCalledWith("/api/profile/me/avatar", undefined);
      expect(result).toEqual(mockUser);
    });

    it("should throw error when regeneration fails", async () => {
      const postSpy = vi.spyOn(fetchClient, "POST");
      postSpy.mockResolvedValueOnce(
        createPostResult({
          data: undefined,
          error: new Error("Unable to regenerate avatar"),
        }),
      );

      await expect(repository.regenerateAvatar()).rejects.toThrow(
        "profile.avatarRegenerateError",
      );
    });
  });
});
