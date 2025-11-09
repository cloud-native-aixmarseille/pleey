import { Card } from "../../../../../shared/components";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("EmptyOrganizationState", {
  slot1: "min-h-screen bg-game-gradient p-4 sm:p-6 lg:p-8 flex items-center justify-center",
  slot2: "p-8 text-center",
  slot3: "text-6xl mb-4",
  slot4: "text-2xl font-bold text-dark-800 mb-2",
  slot5: "text-light-700",
});


interface EmptyOrganizationStateProps {
  title: string;
  description: string;
}

export function EmptyOrganizationState({
  title,
  description,
}: EmptyOrganizationStateProps) {
  return (
    <div {...styles.slot1}>
      <Card {...styles.slot2}>
        <div {...styles.slot3} aria-hidden="true">
          🏢
        </div>
        <h3 {...styles.slot4}>{title}</h3>
        <p {...styles.slot5}>{description}</p>
      </Card>
    </div>
  );
}
