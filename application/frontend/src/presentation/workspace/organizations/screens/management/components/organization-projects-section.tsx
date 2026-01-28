import type { Project } from '../../../../../../domains/project/entities/project';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { ContentStack } from '../../../../../shared/ui/layout/containers';
import { SectionCard } from '../../../../../shared/ui/layout/section-card';
import { OrganizationProjectList } from './organization-project-list';

interface OrganizationProjectsSectionProps {
  readonly actionErrorMessage: string | null;
  readonly canCreateProject: boolean;
  readonly createButtonLabel: string;
  readonly eyebrow: string;
  readonly onCreateProject: () => void;
  readonly onEditProject: (project: Project) => void;
  readonly onRemoveProject: (project: Project) => void;
  readonly projects: readonly Project[];
  readonly selectedProjectId: number | null;
  readonly title: string;
}

export function OrganizationProjectsSection({
  actionErrorMessage,
  canCreateProject,
  createButtonLabel,
  eyebrow,
  onCreateProject,
  onEditProject,
  onRemoveProject,
  projects,
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

          <OrganizationProjectList
            canRemoveProjects={projects.length > 1}
            onEditProject={onEditProject}
            onRemoveProject={onRemoveProject}
            projects={projects}
            selectedProjectId={selectedProjectId}
          />
        </ContentStack>
      </SectionCard>
    </section>
  );
}
