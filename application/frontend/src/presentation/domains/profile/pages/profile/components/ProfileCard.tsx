import { type ReactNode } from "react";

import {
  Card,
  BackToButton,
} from "../../../../../../presentation/shared/ui/components";

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
      variant="neutral"
      padding="lg"
      elevation="glow"
      border="regular"
      motion="fade"
    >
      <div className={CARD_CONTENT_CLASSES}>
        {onBack ? (
          <div className={BACK_ACTION_ROW_CLASSES}>
            <BackToButton label={backLabel} onClick={onBack} />
          </div>
        ) : null}

        {children}
      </div>
    </Card>
  );
}
