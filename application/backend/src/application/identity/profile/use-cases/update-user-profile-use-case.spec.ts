import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createUserFixture } from '../../../../test-utils/fixtures/unit/user.fixture';
import { createUserRepositoryMock } from '../../../../test-utils/mock-factories/user-repository.mock-factory';
import { UpdateUserProfileUseCase } from './update-user-profile-use-case';

describe('UpdateUserProfileUseCase', () => {
  it('throws USER_NOT_FOUND when user does not exist', async () => {
    const userRepository = createUserRepositoryMock({ findById: null });

    const useCase = new UpdateUserProfileUseCase(userRepository);
    await expect(
      useCase.execute(backendTestIdentifiers.user(1), { username: 'alice' }),
    ).rejects.toThrow(IdentityErrorCode.USER_NOT_FOUND);
  });

  it('throws USER_ALREADY_EXISTS when email is taken', async () => {
    const user = createUserFixture({
      id: backendTestIdentifiers.user(1),
      username: 'alice',
      email: 'alice@example.com',
      avatar: null,
    });
    const userRepository = createUserRepositoryMock({
      findById: user as never,
      findByEmail: { id: backendTestIdentifiers.user(2) } as never,
    });

    const useCase = new UpdateUserProfileUseCase(userRepository);
    await expect(
      useCase.execute(backendTestIdentifiers.user(1), { email: 'taken@example.com' }),
    ).rejects.toThrow(IdentityErrorCode.USER_ALREADY_EXISTS);
  });

  it('updates profile and returns public profile', async () => {
    const user = createUserFixture({
      id: backendTestIdentifiers.user(1),
      username: 'alice',
      email: 'alice@example.com',
      avatar: null,
    });

    const updated = createUserFixture({
      id: backendTestIdentifiers.user(1),
      username: 'alice2',
      email: 'alice@example.com',
      avatar: null,
    });

    const userRepository = createUserRepositoryMock({
      findById: user as never,
      findByEmail: null,
      findByUsername: null,
      updateProfile: updated as never,
    });

    const useCase = new UpdateUserProfileUseCase(userRepository);
    const result = await useCase.execute(backendTestIdentifiers.user(1), {
      username: 'alice2',
    });

    expect(userRepository.updateProfile).toHaveBeenCalledWith(backendTestIdentifiers.user(1), {
      username: 'alice2',
      email: undefined,
    });
    expect(result).toMatchObject({
      id: backendTestIdentifiers.user(1),
      username: 'alice2',
    });
  });
});
