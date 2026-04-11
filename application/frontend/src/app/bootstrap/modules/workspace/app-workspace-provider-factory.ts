import { inject, injectable } from 'inversify';
import { createElement, type PropsWithChildren, type ReactNode } from 'react';
import { GameTypeParser } from '../../../../application/game/types/shared/services/game-type-parser';
import { OrganizationFormFacade } from '../../../../application/workspace/organizations/facades/organization-form.facade';
import { ProjectFormFacade } from '../../../../application/workspace/projects/facades/project-form.facade';
import { OrganizationIdentifier } from '../../../../application/workspace/shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../../../application/workspace/shared/services/identifiers/project-identifier';
import {
  provideWorkspaceDependencies,
  type WorkspaceDependencies,
} from '../../../../presentation/workspace/shared/contexts/workspace-dependencies-context';
import { AppProviderOrder, BaseAppProviderFactory } from '../../app-provider-factory';

interface AppWorkspaceProviderProps extends PropsWithChildren {
  readonly dependencies: WorkspaceDependencies;
}

function AppWorkspaceProvider({ children, dependencies }: AppWorkspaceProviderProps) {
  return provideWorkspaceDependencies(children, dependencies);
}

@injectable()
export class AppWorkspaceProviderFactory extends BaseAppProviderFactory {
  readonly order = AppProviderOrder.WORKSPACE;

  constructor(
    @inject(GameTypeParser)
    private readonly gameTypeParser: GameTypeParser,
    @inject(OrganizationFormFacade)
    private readonly organizationFormFacade: OrganizationFormFacade,
    @inject(OrganizationIdentifier)
    private readonly organizationIdentifier: OrganizationIdentifier,
    @inject(ProjectFormFacade)
    private readonly projectFormFacade: ProjectFormFacade,
    @inject(ProjectIdentifier)
    private readonly projectIdentifier: ProjectIdentifier,
  ) {
    super();
  }

  protected create(children: ReactNode): ReactNode {
    const dependencies: WorkspaceDependencies = {
      gameTypeParser: this.gameTypeParser,
      organizationFormFacade: this.organizationFormFacade,
      organizationIdentifier: this.organizationIdentifier,
      projectFormFacade: this.projectFormFacade,
      projectIdentifier: this.projectIdentifier,
    };

    return createElement(AppWorkspaceProvider, { dependencies }, children);
  }
}
