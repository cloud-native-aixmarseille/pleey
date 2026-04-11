import type {
  Organization,
  OrganizationId,
} from '../../../../../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../../../../../domains/organization/entities/organization-dashboard';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { Select } from '../../../../../shared/ui/forms/select';
import { ActionRow, ContentStack } from '../../../../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../../../../shared/ui/layout/panels';
import { SupportingText } from '../../../../../shared/ui/layout/typography';
import { formatDate } from '../../../../dashboard/helpers/format-date';
import { OrganizationMetricsStrip } from './organization-metrics-strip';

interface OrganizationOverviewPanelProps {
  readonly organizations: readonly Organization[];
  readonly organizationId: OrganizationId | null;
  readonly selectedOrganization: Organization | null;
  readonly dashboard: OrganizationDashboard | null;
  readonly isOrganizationsLoading: boolean;
  readonly onOrganizationChange: (value: string) => void;
}

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
    <ElevatedPanel padding="lg">
      <ContentStack gap="md">
        <div role="toolbar" aria-label={t('organization.management.header.title')}>
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
          <ActionRow>
            {selectedOrganization.description ? (
              <SupportingText>{selectedOrganization.description}</SupportingText>
            ) : null}
            {selectedOrganization.role ? (
              <Badge tone="accent">{selectedOrganization.role}</Badge>
            ) : null}
            <SupportingText>
              {t('organization.management.details.created', {
                date: formatDate(selectedOrganization.createdAt, currentLanguage),
              })}
            </SupportingText>
          </ActionRow>
        ) : (
          <SupportingText>{t('organization.management.details.empty')}</SupportingText>
        )}

        {dashboard ? <OrganizationMetricsStrip dashboard={dashboard} /> : null}
      </ContentStack>
    </ElevatedPanel>
  );
}
