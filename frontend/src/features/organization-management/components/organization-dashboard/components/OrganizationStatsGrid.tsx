import { StatsCard } from "../../../../../shared/components/stats/StatsCard";

import type { OrganizationStatItem } from "../types";

interface OrganizationStatsGridProps {
  stats: OrganizationStatItem[];
}

export function OrganizationStatsGrid({ stats }: OrganizationStatsGridProps) {
  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
      {stats.map((stat) => (
        <StatsCard
          key={`${stat.label}-${stat.variant}`}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          variant={stat.variant}
        />
      ))}
    </div>
  );
}
