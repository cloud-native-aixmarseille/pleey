import { inject, injectable } from 'inversify';
import { lazy } from 'react';
import type { PresentationRouteObject, RouteFactory } from '../../../application/shared/ports/routing.port';
import { ThemeIdentifier } from '../../../application/workspace/themes/services/theme-identifier';
import { ProtectedRoute } from '../../shared/routing/protected-route';
import { ThemeManagementRoute } from './theme-management-route';

const ThemeLibraryScreen = lazy(() => import('../screens/theme-library-screen'));
const ThemeCreateScreen = lazy(() => import('../screens/theme-create-screen'));
const ThemeEditScreen = lazy(() => import('../screens/theme-edit-screen'));

@injectable()
export class ThemeRoutesFactory implements RouteFactory {
  constructor(@inject(ThemeIdentifier) private readonly themeIdentifier: ThemeIdentifier) {}

  create(): PresentationRouteObject[] {
    return [
      {
        path: 'workspace/organizations/:organizationId/themes',
        element: (
          <ProtectedRoute>
            <ThemeManagementRoute action="update">
              {(organizationId) => <ThemeLibraryScreen organizationId={organizationId} />}
            </ThemeManagementRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'workspace/organizations/:organizationId/themes/new/:baseThemeId?',
        element: (
          <ProtectedRoute>
            <ThemeManagementRoute action="create">
              {(organizationId) => <ThemeCreateScreen organizationId={organizationId} />}
            </ThemeManagementRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: 'workspace/organizations/:organizationId/themes/:themeId/edit',
        element: (
          <ProtectedRoute>
            <ThemeManagementRoute action="update">
              {(organizationId) => (
                <ThemeEditScreen organizationId={organizationId} themeIdentifier={this.themeIdentifier} />
              )}
            </ThemeManagementRoute>
          </ProtectedRoute>
        ),
      },
    ];
  }
}
