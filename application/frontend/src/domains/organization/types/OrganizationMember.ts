export interface OrganizationMember {
  id: number;
  organizationId: number;
  userId: number;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}
