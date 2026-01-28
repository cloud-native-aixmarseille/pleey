export enum OrganizationRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  MEMBER = 'member',
}

export interface Organization {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly role: OrganizationRole | null;
}
