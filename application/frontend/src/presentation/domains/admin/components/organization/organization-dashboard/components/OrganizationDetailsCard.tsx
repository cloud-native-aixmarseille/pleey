import type { Organization } from "../../../../../../../domains/organization/types";
import {
  Card,
  InfoItem,
} from "../../../../../../../presentation/shared/ui/components";
import { useTheme } from "../../../../../../../presentation/shared/ui/theme";

import type { OrganizationDetailsLabels } from "../types";

const DETAILS_STACK_CLASSES = "flex flex-col gap-4";
const TITLE_CLASSES = "text-2xl font-black tracking-[0.24em]";
const ITEMS_STACK_CLASSES = "flex flex-col gap-4";

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
    <Card surface="panel" variant="primary" elevation="panel" padding="lg">
      <div className={DETAILS_STACK_CLASSES}>
        <h2
          className={TITLE_CLASSES}
          style={{ color: theme.palette.text.primary }}
        >
          {labels.title}
        </h2>
        <div className={ITEMS_STACK_CLASSES}>
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
