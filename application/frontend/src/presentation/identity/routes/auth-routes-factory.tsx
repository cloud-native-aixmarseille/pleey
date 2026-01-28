import { injectable } from 'inversify';
import type {
  PresentationRouteObject,
  RouteFactory,
} from '../../../application/shared/contracts/routing.port';
import { ProtectedRoute } from '../../shared/routing/protected-route';
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
        element: <SignInScreen />,
      },
      {
        path: 'identity/register',
        element: <RegisterScreen />,
      },
      {
        path: 'identity/forgot-password',
        element: <ForgotPasswordScreen />,
      },
      {
        path: 'identity/profile',
        element: (
          <ProtectedRoute>
            <ProfileScreen />
          </ProtectedRoute>
        ),
      },
    ];
  }
}
