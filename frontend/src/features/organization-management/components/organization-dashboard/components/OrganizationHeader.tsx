import type { Organization } from "../../../../../shared/types";
import { Card } from "../../../../../shared/components";
import {
  type IconSource,
  renderIconNode,
} from "../../../../../shared/ui/icons";
import { useTheme } from "../../../../../shared/ui/theme";
import { withAlpha } from "../../../../../shared/ui/utils/color";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("OrganizationHeader", {
  slot1: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
  slot2: "flex items-start gap-4",
  slot3: "flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/30 backdrop-blur-sm",
  slot4: "space-y-2",
  slot5: "text-3xl font-black tracking-[0.24em] sm:text-4xl",
  slot6: "text-sm font-medium",
});


interface OrganizationHeaderProps {
  organization: Organization;
  icon?: IconSource;
}

const DEFAULT_ICON: IconSource = { name: "Building2", tone: "accent" };

export function OrganizationHeader({
  organization,
  icon = DEFAULT_ICON,
}: OrganizationHeaderProps) {
  const theme = useTheme();

  const iconNode = renderIconNode(icon, {
    fallbackTone: "accent",
    size: 40,
    strokeWidth: 1.8,
    primitiveClassName: "text-5xl",
  });

  return (
    <Card
      surface="panel"
      tone="primary"
      elevation="panel"
      padding="lg"
      motion="slide-up"
    >
      <div {...styles.slot1}>
        <div {...styles.slot2}>
          <span
            aria-hidden
            {...styles.slot3}
          >
            {iconNode}
          </span>
          <div {...styles.slot4}>
            <h1
              {...styles.slot5}
              style={{ color: theme.palette.text.primary }}
            >
              {organization.name}
            </h1>
            {organization.description ? (
              <p
                {...styles.slot6}
                style={{ color: withAlpha(theme.palette.text.secondary, 0.9) }}
              >
                {organization.description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
