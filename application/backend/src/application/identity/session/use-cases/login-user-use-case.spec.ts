import { AuthErrorCode } from '../../../../domain/auth/enums/auth-error-code.enum';
import { createTokenPairFixture } from '../../../../test-utils/fixtures/unit/token-pair.fixture';
import { createUserFixture } from '../../../../test-utils/fixtures/unit/user.fixture';
import { createAuthTokenServiceMock } from '../../../../test-utils/mock-factories/auth-token-service.mock-factory';
import { createPasswordServiceMock } from '../../../../test-utils/mock-factories/password-service.mock-factory';
import { createUserRepositoryMock } from '../../../../test-utils/mock-factories/user-repository.mock-factory';
import { LoginUserUseCase } from './login-user-use-case';

describe('LoginUserUseCase', () => {
  it('throws INVALID_CREDENTIALS when user is not found', async () => {
    const userRepository = createUserRepositoryMock({ findByEmail: null });

    const passwordService = createPasswordServiceMock();

    const authTokenService = createAuthTokenServiceMock();

    const useCase = new LoginUserUseCase(
      userRepository as never,
      passwordService as never,
      authTokenService as never,
    );

    await expect(useCase.execute({ email: 'x@y.z', password: 'pw' })).rejects.toThrow(
      AuthErrorCode.INVALID_CREDENTIALS,
    );
  });

  it('generates tokens and updates refresh token on success', async () => {
    const user = createUserFixture({
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      password: 'hashed',
      avatar: null,
    });

    const userRepository = createUserRepositoryMock({
      findByEmail: user as never,
      updateRefreshToken: undefined,
    });

    const passwordService = createPasswordServiceMock({
      compare: true,
      hash: 'refresh-hash',
    });

    const tokenPair = createTokenPairFixture({
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    const authTokenService = createAuthTokenServiceMock({
      createTokenPair: tokenPair as never,
      mapTokensToResponse: {
        accessToken: 'access',
        refreshToken: 'refresh',
      } as never,
    });

    const useCase = new LoginUserUseCase(
      userRepository as never,
      passwordService as never,
      authTokenService as never,
    );

    const result = await useCase.execute({ email: 'alice@example.com', password: 'pw' });

    expect(authTokenService.createTokenPair).toHaveBeenCalledTimes(1);
    expect(passwordService.hash).toHaveBeenCalledWith('refresh');
    expect(userRepository.updateRefreshToken).toHaveBeenCalledWith(
      1,
      'refresh-hash',
      tokenPair.refreshTokenExpiresAt,
    );
    expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
  });
});
