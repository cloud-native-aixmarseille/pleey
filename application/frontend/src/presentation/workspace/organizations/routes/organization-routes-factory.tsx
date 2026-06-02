import { inject, injectable } from 'inversify';
import type {
  PresentationRouteObject,
  RouteFactory,
} from '../../../../application/shared/contracts/routing.port';
import { DashboardWorkspaceFacade } from '../../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import { OrganizationManagementFacade } from '../../../../application/workspace/organizations/facades/organization-management.facade';
import { ProtectedRoute } from '../../../shared/routing/protected-route';
import { OrganizationScreen } from '../screens/management/organization-screen';

@injectable()
export class OrganizationRoutesFactory implements RouteFactory {
  constructor(
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
              listOrganizationMembers={(organizationId) =>
                this.organizationManagementFacade.listOrganizationMembers(organizationId)
              }
              addOrganizationMember={(command) =>
                this.organizationManagementFacade.addOrganizationMember(command)
              }
              removeOrganizationMember={(member) =>
                this.organizationManagementFacade.removeOrganizationMember({ memberId: member.id })
              }
              updateOrganizationMemberRole={(command) =>
                this.organizationManagementFacade.updateOrganizationMemberRole(command)
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
