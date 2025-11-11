import { ReactNode } from "react";
import { Card } from "../../../../../shared/components";

const CARD_WRAPPER_CLASSES =
  "retro-shadow border-4 border-primary-500/50 rounded-[var(--arcade-radius-xl)] overflow-hidden";
const CARD_CONTENT_CLASSES = "p-8 sm:p-12";

interface JoinGameContentCardProps {
  children: ReactNode;
}

export function JoinGameContentCard({ children }: JoinGameContentCardProps) {
  return (
    <div className={CARD_WRAPPER_CLASSES} data-join-game-content-card="true">
      <Card padding="none" elevation="none" border="none" surface="base">
        <div className={CARD_CONTENT_CLASSES}>{children}</div>
      </Card>
    </div>
  );
}
