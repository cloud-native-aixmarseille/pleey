import { ArcadePage, Card } from "../../../../../shared/components";

const EMPTY_CARD_CLASSES = "text-center";
const ICON_CLASSES = "mb-4 text-6xl";
const TITLE_CLASSES = "mb-2 text-2xl font-bold text-dark-800";
const DESCRIPTION_CLASSES = "text-light-700";

interface EmptyOrganizationStateProps {
  title: string;
  description: string;
}

export function EmptyOrganizationState({
  title,
  description,
}: EmptyOrganizationStateProps) {
  return (
    <ArcadePage
      variant="gradient"
      padding="lg"
      contentWidth="md"
      align="center"
      verticalAlign="center"
      data-empty-organization="true"
    >
      <Card
        surface="glass"
        tone="neutral"
        padding="xl"
        border="regular"
        elevation="glow"
        alignment="center"
      >
        <div className={EMPTY_CARD_CLASSES}>
          <div className={ICON_CLASSES} aria-hidden="true">
            🏢
          </div>
          <h3 className={TITLE_CLASSES}>{title}</h3>
          <p className={DESCRIPTION_CLASSES}>{description}</p>
        </div>
      </Card>
    </ArcadePage>
  );
}
