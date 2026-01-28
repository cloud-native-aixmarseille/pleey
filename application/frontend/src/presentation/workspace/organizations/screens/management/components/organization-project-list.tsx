import type { Project } from '../../../../../../domains/project/entities/project';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { surfaceRecipes } from '../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../shared/ui/foundation/ui-typography';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';

interface OrganizationProjectListProps {
  readonly canRemoveProjects: boolean;
  readonly onEditProject: (project: Project) => void;
  readonly onRemoveProject: (project: Project) => void;
  readonly projects: readonly Project[];
  readonly selectedProjectId: number | null;
}

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
} as const;

const rowStyle = {
  ...surfaceRecipes.inset,
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.md,
  justifyContent: 'space-between',
  padding: `${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.md}`,
} as const;

const contentStyle = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  gap: uiThemeTokens.spacing.sm,
  minWidth: 0,
} as const;

const nameStyle = {
  ...uiTypeScale.body,
  color: uiThemeTokens.color.text.emphasis,
  fontWeight: 600,
  margin: 0,
  whiteSpace: 'nowrap',
} as const;

const separatorStyle = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.quiet,
  flexShrink: 0,
  margin: 0,
} as const;

const descriptionStyle = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.secondary,
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const actionsStyle = {
  alignItems: 'center',
  display: 'flex',
  flexShrink: 0,
  gap: uiThemeTokens.spacing.xs,
} as const;

const badgeStyle = {
  ...uiTypeScale.caption,
  background: uiThemeTokens.color.surface.canvas,
  border: `1px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.brand.primary,
  margin: 0,
  padding: `${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.sm}`,
  whiteSpace: 'nowrap',
} as const;

const emptyStyle = {
  ...surfaceRecipes.inset,
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.secondary,
  margin: 0,
  padding: uiThemeTokens.spacing.lg,
} as const;

export function OrganizationProjectList({
  canRemoveProjects,
  onEditProject,
  onRemoveProject,
  projects,
  selectedProjectId,
}: OrganizationProjectListProps) {
  const { t } = usePresentationTranslation();

  if (projects.length === 0) {
    return <p style={emptyStyle}>{t('organization.management.projectsEmpty')}</p>;
  }

  return (
    <div style={listStyle}>
      {projects.map((project) => {
        const isSelected = project.id === selectedProjectId;

        return (
          <article key={project.id} style={rowStyle}>
            <div style={contentStyle}>
              <AppIcon name="catalog" size={16} />
              <p style={nameStyle}>{project.name}</p>
              <p style={separatorStyle} aria-hidden>
                ·
              </p>
              <p style={descriptionStyle}>
                {project.description ?? t('organization.management.projectsDescriptionFallback')}
              </p>
            </div>
            <div style={actionsStyle}>
              {isSelected ? (
                <p style={badgeStyle}>{t('organization.management.projectsSelectedBadge')}</p>
              ) : null}
              <Button intent="outline" size="sm" onClick={() => onEditProject(project)}>
                {t('organization.management.projectsEditButton')}
              </Button>
              <Button
                disabled={!canRemoveProjects}
                intent="ghost"
                size="sm"
                onClick={() => onRemoveProject(project)}
              >
                {t('organization.management.projectsRemoveButton')}
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
