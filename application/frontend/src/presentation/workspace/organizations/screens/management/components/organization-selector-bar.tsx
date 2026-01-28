import type { Organization } from '../../../../../../domains/organization/entities/organization';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Select } from '../../../../../shared/ui/forms/select';
import { surfaceRecipes } from '../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../shared/ui/foundation/ui-typography';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';

interface OrganizationSelectorBarProps {
  readonly organizations: readonly Organization[];
  readonly organizationId: number | null;
  readonly selectedOrganizationName: string | null;
  readonly isOrganizationsLoading: boolean;
  readonly onOrganizationChange: (value: string) => void;
}

const barStyle = {
  ...surfaceRecipes.elevated,
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: uiThemeTokens.spacing.md,
  padding: `${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.lg}`,
} as const;

const selectorGroupStyle = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  gap: uiThemeTokens.spacing.sm,
  minWidth: 0,
} as const;

const selectWrapperStyle = {
  flex: '1 1 16rem',
  maxWidth: '24rem',
  minWidth: 0,
} as const;

const readyLabelStyle = {
  ...uiTypeScale.caption,
  alignItems: 'center',
  color: uiThemeTokens.color.text.soft,
  display: 'flex',
  gap: uiThemeTokens.spacing.xxs,
  margin: 0,
  whiteSpace: 'nowrap',
} as const;

const readyIconStyle = {
  color: uiThemeTokens.color.brand.success,
  display: 'inline-flex',
  flexShrink: 0,
} as const;

export function OrganizationSelectorBar({
  organizations,
  organizationId,
  selectedOrganizationName,
  isOrganizationsLoading,
  onOrganizationChange,
}: OrganizationSelectorBarProps) {
  const { t } = usePresentationTranslation();
  const isReady = selectedOrganizationName !== null;

  return (
    <div style={barStyle} role="toolbar" aria-label={t('organization.management.title')}>
      <div style={selectorGroupStyle}>
        <div style={selectWrapperStyle}>
          <label htmlFor="org-management-select">
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
          </label>
        </div>
      </div>

      {isReady ? (
        <p style={readyLabelStyle}>
          <span style={readyIconStyle}>
            <AppIcon name="success" size={14} />
          </span>
          {selectedOrganizationName}
        </p>
      ) : null}
    </div>
  );
}
