import type { Project, ProjectId } from '../../../../../../domains/project/entities/project';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { EmptyState } from '../../../../../shared/ui/feedback/state-blocks';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ActionRow, ContentStack, WrapRow } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { SupportingText } from '../../../../../shared/ui/layout/typography';

interface OrganizationProjectListProps {
  readonly canRemoveProjects: boolean;
  readonly onEditProject: (project: Project) => void;
  readonly onRemoveProject: (project: Project) => void;
  readonly projects: readonly Project[];
  readonly selectedProjectId: ProjectId | null;
}

export function OrganizationProjectList({
  canRemoveProjects,
  onEditProject,
  onRemoveProject,
  projects,
  selectedProjectId,
}: OrganizationProjectListProps) {
  const { t } = usePresentationTranslation();

  if (projects.length === 0) {
    return <EmptyState>{t('project.management.list.empty')}</EmptyState>;
  }

  return (
    <ContentStack gap="xs">
      {projects.map((project) => {
        const isSelected = project.id === selectedProjectId;

        return (
          <InsetPanel key={project.id} padding="md">
            <article>
              <WrapRow gap="sm">
                <AppIcon name="catalog" size={16} />
                <SupportingText>{project.name}</SupportingText>
                <SupportingText tone="soft" aria-hidden>
                  ·
                </SupportingText>
                <SupportingText>
                  {project.description ?? t('project.management.list.descriptionFallback')}
                </SupportingText>
              </WrapRow>
              <ActionRow gap="sm">
                {isSelected ? (
                  <Badge tone="accent">{t('project.management.list.selectedBadge')}</Badge>
                ) : null}
                <Button intent="outline" size="sm" onClick={() => onEditProject(project)}>
                  {t('project.management.list.editButton')}
                </Button>
                <Button
                  disabled={!canRemoveProjects}
                  intent="ghost"
                  size="sm"
                  onClick={() => onRemoveProject(project)}
                >
                  {t('project.management.list.removeButton')}
                </Button>
              </ActionRow>
            </article>
          </InsetPanel>
        );
      })}
    </ContentStack>
  );
}
