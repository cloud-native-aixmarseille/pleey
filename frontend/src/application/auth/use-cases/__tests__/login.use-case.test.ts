import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '../login.use-case';
import { IAuthRepository } from '../../../domains/auth/ports/auth.repository.interface';
import { IStorage } from '../../../shared/ports/storage.interface';
import { User } from '../../../shared/types';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockAuthRepository: IAuthRepository;
  let mockStorage: IStorage;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    isAdmin: false,
  };

  beforeEach(() => {
    mockAuthRepository = {
      login: vi.fn(),
      register: vi.fn(),
    };

    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    loginUseCase = new LoginUseCase(mockAuthRepository, mockStorage);
  });

  it('should login successfully and store credentials', async () => {
    const mockResponse = { token: 'test-token', user: mockUser };
    vi.mocked(mockAuthRepository.login).mockResolvedValue(mockResponse);

    const result = await loginUseCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual(mockResponse);
    expect(mockAuthRepository.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockStorage.setItem).toHaveBeenCalledWith('quizmaster_token', 'test-token');
    expect(mockStorage.setItem).toHaveBeenCalledWith('quizmaster_user', JSON.stringify(mockUser));
  });

  it('should throw error when login fails', async () => {
    vi.mocked(mockAuthRepository.login).mockRejectedValue(new Error('Invalid credentials'));

    await expect(
      loginUseCase.execute({
        email: 'test@example.com',
        password: 'wrong-password',
      })
    ).rejects.toThrow('Invalid credentials');

    expect(mockStorage.setItem).not.toHaveBeenCalled();
  });
});
