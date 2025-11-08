import type { Organization } from "../../../../../shared/types";
import { Card } from "../../../../../shared/components";

interface OrganizationHeaderProps {
  organization: Organization;
  icon?: string;
}

export function OrganizationHeader({
  organization,
  icon = "🏢",
}: OrganizationHeaderProps) {
  return (
    <Card className="p-6 sm:p-8 mb-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl" aria-hidden="true">
              {icon}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-gradient-neon">
              {organization.name}
            </h1>
          </div>
          {organization.description && (
            <p className="text-light-700 mt-2">{organization.description}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
