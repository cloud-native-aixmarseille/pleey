import type { Organization } from '../../../../../../domains/organization/entities/organization';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { EmptyState } from '../../../../../shared/ui/feedback/state-blocks';
import { ContentStack, WrapRow } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../../shared/ui/layout/typography';
import { formatDate } from '../../../../dashboard/helpers/format-date';

interface OrganizationDetailCardProps {
  readonly organization: Organization | null;
}

export function OrganizationDetailCard({ organization }: OrganizationDetailCardProps) {
  const { currentLanguage, t } = usePresentationTranslation();

  if (!organization) {
    return <EmptyState>{t('organization.management.detailEmpty')}</EmptyState>;
  }

  return (
    <InsetPanel padding="lg">
      <ContentStack gap="xs">
        <Heading level={3}>{organization.name}</Heading>
        <SupportingText>
          {organization.description ?? t('organization.management.detailNoDescription')}
        </SupportingText>
        <WrapRow gap="sm">
          {organization.role ? (
            <Badge tone="accent">{organization.role}</Badge>
          ) : (
            <SupportingText tone="soft">{t('organization.management.detailNoRole')}</SupportingText>
          )}
          <SupportingText tone="soft">
            {t('organization.management.detailCreated', {
              date: formatDate(organization.createdAt, currentLanguage),
            })}
          </SupportingText>
        </WrapRow>
      </ContentStack>
    </InsetPanel>
  );
}
