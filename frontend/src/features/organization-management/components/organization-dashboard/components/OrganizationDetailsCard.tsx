import type { Organization } from "../../../../../shared/types";
import { Card } from "../../../../../shared/components";
import { InfoItem } from "../../../../../shared/components/info/InfoItem";
import { useTheme } from "../../../../../shared/ui/theme";

import type { OrganizationDetailsLabels } from "../types";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("OrganizationDetailsCard", {
  slot1: "space-y-4",
  slot2: "text-2xl font-black tracking-[0.24em]",
});


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
  const theme = useTheme();

  return (
    <Card surface="panel" tone="primary" elevation="panel" padding="lg">
      <div {...styles.slot1}>
        <h2
          {...styles.slot2}
          style={{ color: theme.palette.text.primary }}
        >
          {labels.title}
        </h2>
        <div {...styles.slot1}>
          <InfoItem
            icon={{ name: "ClipboardList", tone: "accent" }}
            label={labels.name}
            value={organization.name}
          />
          {organization.description ? (
            <InfoItem
              icon={{ name: "FileText", tone: "secondary" }}
              label={labels.description}
              value={organization.description}
              tone="secondary"
            />
          ) : null}
          <InfoItem
            icon={{ name: "CalendarDays", tone: "accent" }}
            label={labels.created}
            value={createdDate}
            tone="neutral"
          />
        </div>
      </div>
    </Card>
  );
}
