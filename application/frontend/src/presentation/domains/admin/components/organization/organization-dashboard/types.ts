import type { StatsCardVariant } from "../../../../../../presentation/shared/ui/components";
import type { IconDescriptor } from "../../../../../../presentation/shared/ui/icons";

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
