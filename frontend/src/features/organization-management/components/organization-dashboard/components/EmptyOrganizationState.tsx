import { Card } from "../../../../../shared/components";

interface EmptyOrganizationStateProps {
  title: string;
  description: string;
}

export function EmptyOrganizationState({
  title,
  description,
}: EmptyOrganizationStateProps) {
  return (
    <div className="min-h-screen bg-game-gradient p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <Card className="p-8 text-center">
        <div className="text-6xl mb-4" aria-hidden="true">
          🏢
        </div>
        <h3 className="text-2xl font-bold text-dark-800 mb-2">{title}</h3>
        <p className="text-light-700">{description}</p>
      </Card>
    </div>
  );
}
