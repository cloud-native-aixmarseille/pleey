import { createContext, createElement, type ReactElement, type ReactNode, useContext } from 'react';
import { OrganizationFormFacade } from '../../../../application/workspace/organizations/facades/organization-form.facade';
import { ProjectFormFacade } from '../../../../application/workspace/projects/facades/project-form.facade';
import type { GameType } from '../../../../domains/game/types/shared/game-type';
import type { OrganizationId } from '../../../../domains/organization/entities/organization';
import type { ProjectId } from '../../../../domains/project/entities/project';
import { PresentationContextErrorCode } from '../../../../domains/shared/errors/presentation-context-error-code';

interface OrganizationIdentifierParser {
  parseOrNull(value: unknown): OrganizationId | null;
}

interface ProjectIdentifierParser {
  parseOrNull(value: unknown): ProjectId | null;
}

interface GameTypeParser {
  parseOrNull(value: unknown): GameType | null;
}

export interface WorkspaceDependencies {
  readonly gameTypeParser: GameTypeParser;
  readonly organizationFormFacade: OrganizationFormFacade;
  readonly organizationIdentifier: OrganizationIdentifierParser;
  readonly projectFormFacade: ProjectFormFacade;
  readonly projectIdentifier: ProjectIdentifierParser;
}

const WorkspaceDependenciesContext = createContext<WorkspaceDependencies | null>(null);

export function provideWorkspaceDependencies(
  children: ReactNode,
  value: WorkspaceDependencies,
): ReactElement {
  return createElement(WorkspaceDependenciesContext.Provider, { value }, children);
}

export function useWorkspaceDependencies(): WorkspaceDependencies {
  const dependencies = useContext(WorkspaceDependenciesContext);

  if (!dependencies) {
    throw new Error(PresentationContextErrorCode.PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED);
  }

  return dependencies;
}
