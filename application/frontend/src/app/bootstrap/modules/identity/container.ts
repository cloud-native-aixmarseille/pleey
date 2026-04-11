import { ContainerModule } from 'inversify';
import { AuthSessionTransportToken } from '../../../../application/identity/contracts/auth-runtime.port';
import { GuestIdentifier } from '../../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../../application/identity/shared/services/identifiers/user-identifier';
import { LoginUserUseCase } from '../../../../application/identity/use-cases/login-user-use-case';
import { LogoutUserUseCase } from '../../../../application/identity/use-cases/logout-user-use-case';
import { RegenerateAvatarUseCase } from '../../../../application/identity/use-cases/regenerate-avatar-use-case';
import { RegisterUserUseCase } from '../../../../application/identity/use-cases/register-user-use-case';
import { UpdateProfileUseCase } from '../../../../application/identity/use-cases/update-profile-use-case';
import {
  ROUTE_FACTORY,
  type RouteFactory,
} from '../../../../application/shared/contracts/routing.port';
import { AuthRepositoryToken } from '../../../../domains/identity/ports/auth-repository';
import { AuthPayloadInspector } from '../../../../domains/identity/services/auth-payload-inspector';
import { GraphqlClient } from '../../../../infrastructure/graphql/client/graphql-client';
import { GraphqlAuthRepository } from '../../../../infrastructure/identity/graphql-auth.repository';
import { PersistedAuthSessionAdapter } from '../../../../infrastructure/identity/persisted-auth-session.adapter';
import { AuthRoutesFactory } from '../../../../presentation/identity/routes/auth-routes-factory';
import { AppAuthSessionTransportHub } from '../../../identity/app-auth-session-transport-hub';
import { AppProviderFactoryToken } from '../../app-provider-factory';
import { AppAuthProviderFactory } from './app-auth-provider-factory';

export const identityContainerModule = new ContainerModule(({ bind }) => {
  bind(AuthPayloadInspector).toSelf().inSingletonScope();
  bind(GraphqlClient).toSelf().inSingletonScope();
  bind(AppAuthSessionTransportHub).toSelf().inSingletonScope();
  bind(PersistedAuthSessionAdapter).toSelf().inSingletonScope();
  bind(AppAuthProviderFactory).toSelf().inSingletonScope();
  bind(UserIdentifier)
    .toDynamicValue(() => new UserIdentifier())
    .inSingletonScope();
  bind(GuestIdentifier)
    .toDynamicValue(() => new GuestIdentifier())
    .inSingletonScope();
  bind(LoginUserUseCase).toSelf().inSingletonScope();
  bind(RegisterUserUseCase).toSelf().inSingletonScope();
  bind(LogoutUserUseCase).toSelf().inSingletonScope();
  bind(UpdateProfileUseCase).toSelf().inSingletonScope();
  bind(RegenerateAvatarUseCase).toSelf().inSingletonScope();
  bind(AuthRepositoryToken).to(GraphqlAuthRepository).inSingletonScope();
  bind(AuthSessionTransportToken).toService(AppAuthSessionTransportHub);
  bind(AppProviderFactoryToken).toService(AppAuthProviderFactory);
  bind<RouteFactory>(ROUTE_FACTORY).to(AuthRoutesFactory).inSingletonScope();
});
