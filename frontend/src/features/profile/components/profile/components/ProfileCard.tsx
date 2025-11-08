import { ReactNode } from "react";

import { Button, Card } from "../../../../../shared/components";

interface ProfileCardProps {
  children: ReactNode;
  onBack?: () => void;
  backLabel: string;
}

export function ProfileCard({ children, onBack, backLabel }: ProfileCardProps) {
  return (
    <Card className="p-6 sm:p-10 space-y-8 animate-fade-in">
      {onBack && (
        <div className="flex justify-start">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-light-600 hover:text-light-200"
          >
            {backLabel}
          </Button>
        </div>
      )}

      {children}
    </Card>
  );
}
