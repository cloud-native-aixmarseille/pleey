import { ContainerModule } from 'inversify';
import { AccountFacade } from '../../../../application/identity/facades/account.facade';
import { AccountGatewayToken } from '../../../../application/identity/ports/account.gateway';
import { CaptchaWidgetPortToken } from '../../../../application/identity/ports/captcha-widget.port';
import { GuestIdentifier } from '../../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../../application/identity/shared/services/identifiers/user-identifier';
import { GetCurrentUserUseCase } from '../../../../application/identity/use-cases/get-current-user-use-case';
import { RegenerateAvatarUseCase } from '../../../../application/identity/use-cases/regenerate-avatar-use-case';
import { UpdateProfileUseCase } from '../../../../application/identity/use-cases/update-profile-use-case';
import { ROUTE_FACTORY, type RouteFactory } from '../../../../application/shared/ports/routing.port';
import { AuthRepositoryToken } from '../../../../domains/identity/ports/auth-repository';
import { AuthPayloadInspector } from '../../../../domains/identity/services/auth-payload-inspector';
import { GraphqlClient } from '../../../../infrastructure/graphql/client/graphql-client';
import { CapWidgetAdapter } from '../../../../infrastructure/identity/cap-widget.adapter';
import { GraphqlAuthRepository } from '../../../../infrastructure/identity/graphql-auth.repository';
import { PersistedAuthSessionAdapter } from '../../../../infrastructure/identity/persisted-auth-session.adapter';
import { AuthRoutesFactory } from '../../../../presentation/identity/routes/auth-routes-factory';
import { AppProviderFactoryToken } from '../../app-provider-factory';
import { AppAuthProviderFactory } from './app-auth-provider-factory';
import { AppCaptchaProviderFactory } from './app-captcha-provider-factory';

export const identityContainerModule = new ContainerModule(({ bind }) => {
  bind(CaptchaWidgetPortToken).to(CapWidgetAdapter).inSingletonScope();
  bind(AppCaptchaProviderFactory).toSelf().inSingletonScope();
  bind(AppProviderFactoryToken).toService(AppCaptchaProviderFactory);
  bind(AccountGatewayToken).to(AccountFacade).inSingletonScope();
  bind(GetCurrentUserUseCase).toSelf().inSingletonScope();
  bind(AuthPayloadInspector).toSelf().inSingletonScope();
  bind(GraphqlClient).toSelf().inSingletonScope();
  bind(PersistedAuthSessionAdapter).toSelf().inSingletonScope();
  bind(AppAuthProviderFactory).toSelf().inSingletonScope();
  bind(UserIdentifier)
    .toDynamicValue(() => new UserIdentifier())
    .inSingletonScope();
  bind(GuestIdentifier)
    .toDynamicValue(() => new GuestIdentifier())
    .inSingletonScope();
  bind(UpdateProfileUseCase).toSelf().inSingletonScope();
  bind(RegenerateAvatarUseCase).toSelf().inSingletonScope();
  bind(AuthRepositoryToken).to(GraphqlAuthRepository).inSingletonScope();
  bind(AppProviderFactoryToken).toService(AppAuthProviderFactory);
  bind<RouteFactory>(ROUTE_FACTORY).to(AuthRoutesFactory).inSingletonScope();
});
