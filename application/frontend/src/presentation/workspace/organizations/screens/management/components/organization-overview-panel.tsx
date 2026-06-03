import type {
  Organization,
  OrganizationId,
} from '../../../../../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../../../../../domains/organization/entities/organization-dashboard';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { AsyncCombobox } from '../../../../../shared/ui/forms/async-combobox';
import { ActionRow, ContentStack } from '../../../../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../../../../shared/ui/layout/panels';
import { SupportingText } from '../../../../../shared/ui/layout/typography';
import { formatDate } from '../../../../dashboard/helpers/format-date';
import { OrganizationMetricsStrip } from './organization-metrics-strip';

interface OrganizationOverviewPanelProps {
  readonly organizations: readonly Organization[];
  readonly hasMoreOrganizations: boolean;
  readonly organizationId: OrganizationId | null;
  readonly organizationEmptyLabel: string;
  readonly organizationLoadingLabel: string;
  readonly organizationNoResultsLabel: string;
  readonly organizationSearchLabel: string;
  readonly organizationSearchPlaceholder: string;
  readonly selectedOrganization: Organization | null;
  readonly dashboard: OrganizationDashboard | null;
  readonly isOrganizationsLoading: boolean;
  readonly isLoadingMoreOrganizations: boolean;
  readonly onOrganizationChange: (value: string) => void;
  readonly onOrganizationSearchChange: (value: string) => void;
  readonly onLoadMoreOrganizations: () => void;
}

export function OrganizationOverviewPanel({
  organizations,
  hasMoreOrganizations,
  organizationId,
  organizationEmptyLabel,
  organizationLoadingLabel,
  organizationNoResultsLabel,
  organizationSearchLabel,
  organizationSearchPlaceholder,
  selectedOrganization,
  dashboard,
  isOrganizationsLoading,
  isLoadingMoreOrganizations,
  onOrganizationChange,
  onOrganizationSearchChange,
  onLoadMoreOrganizations,
}: OrganizationOverviewPanelProps) {
  const { currentLanguage, t } = usePresentationTranslation();

  return (
    <ElevatedPanel padding="lg">
      <ContentStack gap="md">
        <div role="toolbar" aria-label={t('organization.management.header.title')}>
          <AsyncCombobox
            ariaLabel={t('dashboard.workspace.organizationLabel')}
            disabled={isOrganizationsLoading}
            emptyLabel={organizationEmptyLabel}
            hasMore={hasMoreOrganizations}
            id="org-management-select"
            isLoading={isOrganizationsLoading}
            isLoadingMore={isLoadingMoreOrganizations}
            loadingLabel={organizationLoadingLabel}
            noResultsLabel={organizationNoResultsLabel}
            onChange={(value) => onOrganizationChange(value ?? '')}
            onLoadMore={onLoadMoreOrganizations}
            onSearchChange={onOrganizationSearchChange}
            options={organizations.map((organization) => ({
              value: String(organization.id),
              label: organization.name,
            }))}
            placeholder={t('dashboard.workspace.organizationPlaceholder')}
            searchAriaLabel={organizationSearchLabel}
            searchPlaceholder={organizationSearchPlaceholder}
            selectedLabel={selectedOrganization?.name ?? null}
            value={organizationId === null ? null : String(organizationId)}
          />
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
