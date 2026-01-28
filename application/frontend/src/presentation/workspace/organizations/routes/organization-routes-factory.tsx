import { inject, injectable } from 'inversify';
import type {
  PresentationRouteObject,
  RouteFactory,
} from '../../../../application/shared/contracts/routing.port';
import { DashboardReadFacade } from '../../../../application/workspace/dashboard/facades/dashboard-read.facade';
import { DashboardWorkspaceFacade } from '../../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import type { DashboardReadGateway } from '../../../../application/workspace/dashboard/gateways/dashboard-read.gateway';
import { OrganizationManagementFacade } from '../../../../application/workspace/organizations/facades/organization-management.facade';
import { ProtectedRoute } from '../../../shared/routing/protected-route';
import { OrganizationScreen } from '../screens/management/organization-screen';

@injectable()
export class OrganizationRoutesFactory implements RouteFactory {
  constructor(
    @inject(DashboardReadFacade)
    private readonly dashboardReadFacade: DashboardReadGateway,
    @inject(DashboardWorkspaceFacade)
    private readonly dashboardWorkspaceFacade: DashboardWorkspaceFacade,
    @inject(OrganizationManagementFacade)
    private readonly organizationManagementFacade: OrganizationManagementFacade,
  ) {}

  create(): PresentationRouteObject[] {
    return [
      {
        path: 'workspace/organizations',
        element: (
          <ProtectedRoute>
            <OrganizationScreen
              dashboardWorkspace={this.dashboardWorkspaceFacade}
              createOrganization={(command) =>
                this.organizationManagementFacade.createOrganization(command)
              }
              createProject={(command) => this.organizationManagementFacade.createProject(command)}
              updateProject={(command) => this.organizationManagementFacade.updateProject(command)}
              deleteProject={(command) => this.organizationManagementFacade.deleteProject(command)}
            />
          </ProtectedRoute>
        ),
      },
    ];
  }
}
