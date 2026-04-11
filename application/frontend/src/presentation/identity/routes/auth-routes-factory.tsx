import { injectable } from 'inversify';
import type {
  PresentationRouteObject,
  RouteFactory,
} from '../../../application/shared/contracts/routing.port';
import { GuestOnlyRoute } from '../../shared/routing/guest-only-route';
import { ProtectedRoute } from '../../shared/routing/protected-route';
import { PatienceRouteProvider } from '../../shared/ui/patience';
import { ForgotPasswordScreen } from '../screens/forgot-password/forgot-password-screen';
import { ProfileScreen } from '../screens/profile/profile-screen';
import { RegisterScreen } from '../screens/register/register-screen';
import { SignInScreen } from '../screens/sign-in/sign-in-screen';

@injectable()
export class AuthRoutesFactory implements RouteFactory {
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
        path: 'identity/profile',
        element: (
          <PatienceRouteProvider>
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          </PatienceRouteProvider>
        ),
      },
    ];
  }
}
