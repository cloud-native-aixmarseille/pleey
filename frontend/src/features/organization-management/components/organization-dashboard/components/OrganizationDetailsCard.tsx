import type { Organization } from "../../../../../shared/types";
import { Card } from "../../../../../shared/components";
import { InfoItem } from "../../../../../shared/components/info/InfoItem";

import type { OrganizationDetailsLabels } from "../types";

interface OrganizationDetailsCardProps {
  organization: Organization;
  createdDate: string;
  labels: OrganizationDetailsLabels;
}

export function OrganizationDetailsCard({
  organization,
  createdDate,
  labels,
}: OrganizationDetailsCardProps) {
  return (
    <Card className="p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-dark-800 mb-4">{labels.title}</h2>
      <div className="space-y-3">
        <InfoItem icon="📋" label={labels.name} value={organization.name} />
        {organization.description && (
          <InfoItem
            icon="📝"
            label={labels.description}
            value={organization.description}
          />
        )}
        <InfoItem icon="📅" label={labels.created} value={createdDate} />
      </div>
    </Card>
  );
}
