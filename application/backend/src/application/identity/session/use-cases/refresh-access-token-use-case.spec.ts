import { AuthErrorCode } from '../../../../domain/auth/enums/auth-error-code.enum';
import { createTokenPairFixture } from '../../../../test-utils/fixtures/unit/token-pair.fixture';
import { createUserFixture } from '../../../../test-utils/fixtures/unit/user.fixture';
import { createAuthTokenServiceMock } from '../../../../test-utils/mock-factories/auth-token-service.mock-factory';
import { createPasswordServiceMock } from '../../../../test-utils/mock-factories/password-service.mock-factory';
import { createUserRepositoryMock } from '../../../../test-utils/mock-factories/user-repository.mock-factory';
import { RefreshAccessTokenUseCase } from './refresh-access-token-use-case';

describe('RefreshAccessTokenUseCase', () => {
  it('clears refresh token and throws when refresh token is expired', async () => {
    const user = createUserFixture({
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      avatar: null,
      refreshTokenHash: 'hash',
      refreshTokenExpiresAt: new Date(Date.now() - 1000),
    });

    const userRepository = createUserRepositoryMock({
      findById: user as never,
      clearRefreshToken: undefined,
    });

    const passwordService = createPasswordServiceMock();

    const authTokenService = createAuthTokenServiceMock({ verifyRefreshToken: 1 });

    const useCase = new RefreshAccessTokenUseCase(
      userRepository,
      passwordService as never,
      authTokenService as never,
    );

    await expect(useCase.execute('refresh')).rejects.toThrow(AuthErrorCode.REFRESH_TOKEN_EXPIRED);
    expect(userRepository.clearRefreshToken).toHaveBeenCalledWith(1);
  });

  it('returns new tokens when refresh token is valid', async () => {
    const user = createUserFixture({
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      avatar: null,
      refreshTokenHash: 'hash',
      refreshTokenExpiresAt: new Date(Date.now() + 60_000),
    });

    const userRepository = createUserRepositoryMock({
      findById: user as never,
      updateRefreshToken: undefined,
      clearRefreshToken: undefined,
    });

    const passwordService = createPasswordServiceMock({
      compare: true,
      hash: 'new-hash',
    });

    const tokenPair = createTokenPairFixture({
      accessToken: 'access',
      refreshToken: 'refresh2',
      refreshTokenExpiresAt: new Date(Date.now() + 120_000),
    });

    const authTokenService = createAuthTokenServiceMock({
      verifyRefreshToken: 1,
      createTokenPair: tokenPair as never,
      mapTokensToResponse: {
        accessToken: 'access',
        refreshToken: 'refresh2',
      } as never,
    });

    const useCase = new RefreshAccessTokenUseCase(
      userRepository,
      passwordService as never,
      authTokenService as never,
    );

    const result = await useCase.execute('refresh');

    expect(passwordService.compare).toHaveBeenCalledWith('refresh', 'hash');
    expect(userRepository.updateRefreshToken).toHaveBeenCalledWith(
      1,
      'new-hash',
      tokenPair.refreshTokenExpiresAt,
    );
    expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh2' });
  });
});
