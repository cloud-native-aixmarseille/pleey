import type { Organization } from '../../../../../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../../../../../domains/organization/entities/organization-dashboard';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { Select } from '../../../../../shared/ui/forms/select';
import { surfaceRecipes } from '../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../shared/ui/foundation/ui-typography';
import { formatDate } from '../../../../dashboard/helpers/format-date';
import { OrganizationMetricsStrip } from './organization-metrics-strip';

interface OrganizationOverviewPanelProps {
  readonly organizations: readonly Organization[];
  readonly organizationId: number | null;
  readonly selectedOrganization: Organization | null;
  readonly dashboard: OrganizationDashboard | null;
  readonly isOrganizationsLoading: boolean;
  readonly onOrganizationChange: (value: string) => void;
}

const rootStyle = {
  ...surfaceRecipes.elevated,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.md,
  padding: uiThemeTokens.spacing.lg,
} as const;

const headerRowStyle = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: uiThemeTokens.spacing.md,
} as const;

const selectorWrapperStyle = {
  flexShrink: 0,
  width: '18rem',
} as const;

const detailsStyle = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap',
  gap: uiThemeTokens.spacing.sm,
  minWidth: 0,
} as const;

const descriptionStyle = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.secondary,
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const separatorStyle = {
  color: uiThemeTokens.color.text.quiet,
  flexShrink: 0,
} as const;

const dateStyle = {
  ...uiTypeScale.caption,
  color: uiThemeTokens.color.text.soft,
  flexShrink: 0,
  whiteSpace: 'nowrap',
} as const;

const emptyStyle = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.quiet,
  margin: 0,
} as const;

export function OrganizationOverviewPanel({
  organizations,
  organizationId,
  selectedOrganization,
  dashboard,
  isOrganizationsLoading,
  onOrganizationChange,
}: OrganizationOverviewPanelProps) {
  const { currentLanguage, t } = usePresentationTranslation();

  return (
    <div style={rootStyle}>
      <div style={headerRowStyle}>
        <div
          role="toolbar"
          aria-label={t('organization.management.title')}
          style={selectorWrapperStyle}
        >
          <Select
            aria-label={t('dashboard.workspace.organizationLabel')}
            disabled={isOrganizationsLoading}
            id="org-management-select"
            onChange={(event) => onOrganizationChange(event.currentTarget.value)}
            value={organizationId === null ? '' : String(organizationId)}
          >
            <option value="">{t('dashboard.workspace.organizationPlaceholder')}</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </Select>
        </div>

        {selectedOrganization ? (
          <div style={detailsStyle}>
            {selectedOrganization.description ? (
              <>
                <p style={descriptionStyle}>{selectedOrganization.description}</p>
                <span style={separatorStyle} aria-hidden>
                  ·
                </span>
              </>
            ) : null}
            {selectedOrganization.role ? (
              <Badge tone="accent">{selectedOrganization.role}</Badge>
            ) : null}
            <span style={dateStyle}>
              {t('organization.management.detailCreated', {
                date: formatDate(selectedOrganization.createdAt, currentLanguage),
              })}
            </span>
          </div>
        ) : (
          <p style={emptyStyle}>{t('organization.management.detailEmpty')}</p>
        )}
      </div>

      {dashboard ? <OrganizationMetricsStrip dashboard={dashboard} /> : null}
    </div>
  );
}
