import { ArcadeCardGrid } from "../../../../../shared/components";
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
    <ArcadeCardGrid layout="quad">
      {stats.map((stat) => (
        <StatsCard
          key={`${stat.label}-${stat.variant}`}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          variant={stat.variant}
        />
      ))}
    </ArcadeCardGrid>
  );
}
