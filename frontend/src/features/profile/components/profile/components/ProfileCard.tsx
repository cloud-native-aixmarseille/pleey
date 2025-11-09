import { ReactNode } from "react";

import { Button, Card } from "../../../../../shared/components";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("ProfileCard", {
  slot1: "p-6 sm:p-10 space-y-8 animate-fade-in",
  slot2: "flex justify-start",
  slot3: "text-light-600 hover:text-light-200",
});


interface ProfileCardProps {
  children: ReactNode;
  onBack?: () => void;
  backLabel: string;
}

export function ProfileCard({ children, onBack, backLabel }: ProfileCardProps) {
  return (
    <Card {...styles.slot1}>
      {onBack && (
        <div {...styles.slot2}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            {...styles.slot3}
          >
            {backLabel}
          </Button>
        </div>
      )}

      {children}
    </Card>
  );
}
