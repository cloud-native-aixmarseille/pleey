import { inject, injectable } from 'inversify';
import { type AccountGateway, AccountGatewayToken } from '../../../application/identity/ports/account.gateway';
import type { PresentationRouteObject, RouteFactory } from '../../../application/shared/ports/routing.port';
import { GuestOnlyRoute } from '../../shared/routing/guest-only-route';
import { ProtectedRoute } from '../../shared/routing/protected-route';
import { PatienceRouteProvider } from '../../shared/ui/patience';
import { AccountProvider } from '../contexts/account-context';
import { ForgotPasswordScreen } from '../screens/forgot-password/forgot-password-screen';
import { ProfileScreen } from '../screens/profile/profile-screen';
import { RegisterScreen } from '../screens/register/register-screen';
import { ResetPasswordScreen } from '../screens/reset-password/reset-password-screen';
import { SignInScreen } from '../screens/sign-in/sign-in-screen';

@injectable()
export class AuthRoutesFactory implements RouteFactory {
  constructor(@inject(AccountGatewayToken) private readonly account: AccountGateway) {}

  create(): PresentationRouteObject[] {
    return [
      {
        path: 'identity/sign-in',
        element: (
          <PatienceRouteProvider>
            <GuestOnlyRoute>
              <SignInScreen />
            </GuestOnlyRoute>
          </PatienceRouteProvider>
        ),
      },
      {
        path: 'identity/register',
        element: (
          <PatienceRouteProvider>
            <GuestOnlyRoute>
              <RegisterScreen />
            </GuestOnlyRoute>
          </PatienceRouteProvider>
        ),
      },
      {
        path: 'identity/forgot-password',
        element: (
          <PatienceRouteProvider>
            <ForgotPasswordScreen />
          </PatienceRouteProvider>
        ),
      },
      {
        path: 'identity/reset-password',
        element: (
          <PatienceRouteProvider>
            <ResetPasswordScreen />
          </PatienceRouteProvider>
        ),
      },
      {
        path: 'identity/profile/:section?',
        element: (
          <PatienceRouteProvider>
            <ProtectedRoute>
              <AccountProvider value={this.account}>
                <ProfileScreen />
              </AccountProvider>
            </ProtectedRoute>
          </PatienceRouteProvider>
        ),
      },
    ];
  }
}
