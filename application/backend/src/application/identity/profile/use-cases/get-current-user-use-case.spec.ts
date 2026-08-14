import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createUserFixture } from '../../../../test-utils/fixtures/unit/user.fixture';
import { createUserRepositoryMock } from '../../../../test-utils/mock-factories/user-repository.mock-factory';
import { GetCurrentUserUseCase } from './get-current-user-use-case';

describe('GetCurrentUserUseCase', () => {
  it('throws USER_NOT_FOUND when user does not exist', async () => {
    // Arrange
    const userRepository = createUserRepositoryMock({ findById: null });

    const useCase = new GetCurrentUserUseCase(userRepository);

    // Act + Assert
    await expect(useCase.execute(backendTestIdentifiers.user(123))).rejects.toThrow(IdentityErrorCode.USER_NOT_FOUND);
  });

  it('returns a public profile for existing user', async () => {
    // Arrange
    const user = createUserFixture();

    const userRepository = createUserRepositoryMock({ findById: user });

    const useCase = new GetCurrentUserUseCase(userRepository);
    // Act
    const result = await useCase.execute(backendTestIdentifiers.user(1));

    // Assert
    expect(result).toMatchObject({
      id: backendTestIdentifiers.user(1),
      username: 'alice',
      email: 'alice@example.com',
    });
  });
});
