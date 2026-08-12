import { inject, injectable } from 'inversify';
import type { AuthSession } from '../../domains/identity/entities/auth-session';
import type { User } from '../../domains/identity/entities/user';
import { AUTH_ERROR_DEFINITIONS, AuthErrorCode } from '../../domains/identity/errors/auth-error-code';
import {
  InvalidLoginResponseError,
  InvalidRegenerateAvatarResponseError,
  InvalidRegistrationResponseError,
  InvalidUpdateProfileResponseError,
} from '../../domains/identity/errors/graphql-auth-repository.error';
import type { AuthRepository, UpdateProfileInput } from '../../domains/identity/ports/auth-repository';
import { AuthPayloadInspector } from '../../domains/identity/services/auth-payload-inspector';
import { GraphqlClient } from '../graphql/client/graphql-client';
import {
  LoginDocument,
  type LoginMutation,
  type LoginMutationVariables,
  LogoutDocument,
  type LogoutMutation,
  RegenerateAvatarDocument,
  type RegenerateAvatarMutation,
  RegisterDocument,
  type RegisterMutation,
  type RegisterMutationVariables,
  UpdateProfileDocument,
  type UpdateProfileMutation,
  type UpdateProfileMutationVariables,
} from '../graphql/generated/graphql';

@injectable()
export class GraphqlAuthRepository implements AuthRepository {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
    @inject(AuthPayloadInspector)
    private readonly payloadInspector: AuthPayloadInspector,
  ) {}

  async login(email: string, password: string): Promise<AuthSession> {
    try {
      const result = await this.graphqlClient.request<LoginMutation, LoginMutationVariables>(LoginDocument, {
        input: { email, password },
      });
      const session = this.payloadInspector.toAuthSession(result.login);

      if (!session) {
        throw new InvalidLoginResponseError({ operationName: 'login' });
      }

      return session;
    } catch (error) {
      throw this.graphqlClient.resolveDomainError(error, AUTH_ERROR_DEFINITIONS[AuthErrorCode.INVALID_CREDENTIALS], {
        operationName: 'login',
      });
    }
  }

  async register(username: string, email: string, password: string): Promise<User> {
    try {
      const result = await this.graphqlClient.request<RegisterMutation, RegisterMutationVariables>(RegisterDocument, {
        input: { username, email, password },
      });
      const user = this.payloadInspector.toUser(result.register);

      if (!user) {
        throw new InvalidRegistrationResponseError({ operationName: 'register' });
      }

      return user;
    } catch (error) {
      throw this.graphqlClient.resolveDomainError(error, AUTH_ERROR_DEFINITIONS[AuthErrorCode.REGISTRATION_FAILED], {
        operationName: 'register',
      });
    }
  }

  async updateProfile(input: UpdateProfileInput): Promise<User> {
    try {
      const result = await this.graphqlClient.request<UpdateProfileMutation, UpdateProfileMutationVariables>(
        UpdateProfileDocument,
        { input },
      );
      const user = this.payloadInspector.toUser(result.updateProfile);

      if (!user) {
        throw new InvalidUpdateProfileResponseError({ operationName: 'updateProfile' });
      }

      return user;
    } catch (error) {
      throw this.graphqlClient.resolveDomainError(error, AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC], {
        operationName: 'updateProfile',
      });
    }
  }

  async regenerateAvatar(): Promise<User> {
    try {
      const result = await this.graphqlClient.request<RegenerateAvatarMutation>(RegenerateAvatarDocument);
      const user = this.payloadInspector.toUser(result.regenerateAvatar);

      if (!user) {
        throw new InvalidRegenerateAvatarResponseError({
          operationName: 'regenerateAvatar',
        });
      }

      return user;
    } catch (error) {
      throw this.graphqlClient.resolveDomainError(error, AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC], {
        operationName: 'regenerateAvatar',
      });
    }
  }

  async logout(): Promise<void> {
    try {
      await this.graphqlClient.request<LogoutMutation>(LogoutDocument, undefined, {
        skipAuthRefresh: true,
      });
    } catch {
      // Client cleanup should still proceed even if logout transport fails.
    }
  }
}
