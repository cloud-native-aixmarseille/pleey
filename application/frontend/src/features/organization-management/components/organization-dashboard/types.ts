import type { StatsCardVariant } from "../../../../shared/components/stats/StatsCard";
import type { IconDescriptor } from "../../../../shared/ui/icons";

export type OrganizationStatVariant = StatsCardVariant;

export interface OrganizationStatItem {
  label: string;
  value: number;
  icon: IconDescriptor;
  variant: OrganizationStatVariant;
}

export interface OrganizationDetailsLabels {
  title: string;
  name: string;
  description: string;
  created: string;
}
