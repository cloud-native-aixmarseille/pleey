import { ReactNode } from "react";
import { Card } from "../../../../../shared/components";

interface JoinGameContentCardProps {
  children: ReactNode;
}

export function JoinGameContentCard({ children }: JoinGameContentCardProps) {
  return (
    <Card className="p-8 sm:p-12 retro-shadow border-4 border-primary-500/50">
      {children}
    </Card>
  );
}
