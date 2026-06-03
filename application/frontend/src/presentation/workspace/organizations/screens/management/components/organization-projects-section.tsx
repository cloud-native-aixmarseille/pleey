import type { Project, ProjectId } from '../../../../../../domains/project/entities/project';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { Input } from '../../../../../shared/ui/forms/input';
import { ContentStack } from '../../../../../shared/ui/layout/containers';
import { SectionCard } from '../../../../../shared/ui/layout/section-card';
import {
  PaginationBar,
  type PaginationViewModel,
} from '../../../../shared/components/pagination-bar';
import { OrganizationProjectList } from './organization-project-list';

interface OrganizationProjectsSectionProps {
  readonly actionErrorMessage: string | null;
  readonly canCreateProject: boolean;
  readonly canRemoveProjects: boolean;
  readonly createButtonLabel: string;
  readonly eyebrow: string;
  readonly onCreateProject: () => void;
  readonly onEditProject: (project: Project) => void;
  readonly onProjectSearchChange: (value: string) => void;
  readonly onRemoveProject: (project: Project) => void;
  readonly pagination: PaginationViewModel;
  readonly projects: readonly Project[];
  readonly projectSearchLabel: string;
  readonly projectSearchPlaceholder: string;
  readonly projectSearchValue: string;
  readonly searchDisabled: boolean;
  readonly selectedProjectId: ProjectId | null;
  readonly title: string;
}

export function OrganizationProjectsSection({
  actionErrorMessage,
  canCreateProject,
  canRemoveProjects,
  createButtonLabel,
  eyebrow,
  onCreateProject,
  onEditProject,
  onProjectSearchChange,
  onRemoveProject,
  pagination,
  projects,
  projectSearchLabel,
  projectSearchPlaceholder,
  projectSearchValue,
  searchDisabled,
  selectedProjectId,
  title,
}: OrganizationProjectsSectionProps) {
  return (
    <section id="projects">
      <SectionCard
        eyebrow={eyebrow}
        title={title}
        actions={
          <Button disabled={!canCreateProject} intent="primary" size="sm" onClick={onCreateProject}>
            {createButtonLabel}
          </Button>
        }
      >
        <ContentStack gap="md">
          <StatusBanner tone="error">{actionErrorMessage}</StatusBanner>

          <div aria-label={projectSearchLabel} role="search">
            <Input
              aria-label={projectSearchLabel}
              compact
              disabled={searchDisabled}
              onChange={(event) => onProjectSearchChange(event.target.value)}
              placeholder={projectSearchPlaceholder}
              type="search"
              value={projectSearchValue}
            />
          </div>

          <OrganizationProjectList
            canRemoveProjects={canRemoveProjects}
            onEditProject={onEditProject}
            onRemoveProject={onRemoveProject}
            projects={projects}
            selectedProjectId={selectedProjectId}
          />

          <PaginationBar {...pagination} />
        </ContentStack>
      </SectionCard>
    </section>
  );
}
