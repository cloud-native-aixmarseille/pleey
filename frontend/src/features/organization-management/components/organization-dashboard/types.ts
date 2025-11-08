export type OrganizationStatVariant = "primary" | "secondary" | "accent" | "purple";

export interface OrganizationStatItem {
  label: string;
  value: number;
  icon: string;
  variant: OrganizationStatVariant;
}

export interface OrganizationDetailsLabels {
  title: string;
  name: string;
  description: string;
  created: string;
}
