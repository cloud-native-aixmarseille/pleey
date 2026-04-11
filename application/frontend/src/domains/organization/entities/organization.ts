export type OrganizationId = number & {
  readonly __identifierBrand: 'OrganizationId';
};

export enum OrganizationRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  MEMBER = 'member',
}

export interface Organization {
  readonly id: OrganizationId;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly role: OrganizationRole | null;
}
