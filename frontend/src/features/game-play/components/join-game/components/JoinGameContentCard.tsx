import { ReactNode } from "react";
import { Card } from "../../../../../shared/components";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("JoinGameContentCard", {
  slot1: "p-8 sm:p-12 retro-shadow border-4 border-primary-500/50",
});


interface JoinGameContentCardProps {
  children: ReactNode;
}

export function JoinGameContentCard({ children }: JoinGameContentCardProps) {
  return (
    <Card {...styles.slot1}>
      {children}
    </Card>
  );
}
