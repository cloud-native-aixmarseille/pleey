import { AuthErrorCode } from '../../../../domain/auth/enums/auth-error-code.enum';
import { createUserFixture } from '../../../../test-utils/fixtures/unit/user.fixture';
import { createUserRepositoryMock } from '../../../../test-utils/mock-factories/user-repository.mock-factory';
import { GetCurrentUserUseCase } from './get-current-user-use-case';

describe('GetCurrentUserUseCase', () => {
  it('throws USER_NOT_FOUND when user does not exist', async () => {
    const userRepository = createUserRepositoryMock({ findById: null });

    const useCase = new GetCurrentUserUseCase(userRepository);

    await expect(useCase.execute(123)).rejects.toThrow(AuthErrorCode.USER_NOT_FOUND);
  });

  it('returns a public profile for existing user', async () => {
    const user = createUserFixture();

    const userRepository = createUserRepositoryMock({ findById: user });

    const useCase = new GetCurrentUserUseCase(userRepository);
    const result = await useCase.execute(1);

    expect(result).toMatchObject({ id: 1, username: 'alice', email: 'alice@example.com' });
  });
});
