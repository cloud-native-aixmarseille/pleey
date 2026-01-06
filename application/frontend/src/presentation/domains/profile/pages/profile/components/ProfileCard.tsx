import { type ReactNode } from "react";

import { Button, Card } from "../../../../../../presentation/shared/ui/components";

const CARD_CONTENT_CLASSES = "flex flex-col gap-8";
const BACK_ACTION_ROW_CLASSES = "flex justify-start";

interface ProfileCardProps {
  children: ReactNode;
  onBack?: () => void;
  backLabel: string;
}

export function ProfileCard({ children, onBack, backLabel }: ProfileCardProps) {
  return (
    <Card
      surface="glass"
      tone="neutral"
      padding="lg"
      elevation="glow"
      border="regular"
      motion="fade"
    >
      <div className={CARD_CONTENT_CLASSES}>
        {onBack ? (
          <div className={BACK_ACTION_ROW_CLASSES}>
            <Button
              type="button"
              variant="ghost"
              tone="neutral"
              effect="flat"
              size="sm"
              onClick={onBack}
              alignment="start"
            >
              {backLabel}
            </Button>
          </div>
        ) : null}

        {children}
      </div>
    </Card>
  );
}
