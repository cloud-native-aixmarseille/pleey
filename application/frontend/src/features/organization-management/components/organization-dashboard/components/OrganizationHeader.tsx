import type { Organization } from "../../../../../shared/types";
import { ArcadeSectionHeader, Card } from "../../../../../shared/components";
import {
  type IconSource,
  renderIconNode,
} from "../../../../../shared/ui/icons";

const HEADER_CONTENT_CLASSES =
  "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between";
const HEADER_STACK_CLASSES = "flex items-start gap-4";
const ICON_WRAPPER_CLASSES =
  "flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/30 backdrop-blur-sm";
const HEADER_TEXT_WRAPPER_CLASSES = "flex flex-col gap-2";
const SECTION_HEADER_WRAPPER_CLASSES = "text-left";

interface OrganizationHeaderProps {
  organization: Organization;
  icon?: IconSource;
}

const DEFAULT_ICON: IconSource = { name: "Building2", tone: "accent" };

export function OrganizationHeader({
  organization,
  icon = DEFAULT_ICON,
}: OrganizationHeaderProps) {
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
      <div className={HEADER_CONTENT_CLASSES}>
        <div className={HEADER_STACK_CLASSES}>
          <span aria-hidden className={ICON_WRAPPER_CLASSES}>
            {iconNode}
          </span>
          <div className={HEADER_TEXT_WRAPPER_CLASSES}>
            <div className={SECTION_HEADER_WRAPPER_CLASSES}>
              <ArcadeSectionHeader
                title={organization.name}
                subtitle={organization.description || undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
