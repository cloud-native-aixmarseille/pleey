import type { OrganizationId } from '../../organization/entities/organization';

export type ProjectId = number;

export class Project {
  constructor(
    public readonly id: ProjectId,
    public readonly name: string,
    public readonly description: string | null,
    public readonly organizationId: OrganizationId,
    public readonly createdAt: Date,
  ) {}

  hasValidName(): boolean {
    return this.name.trim().length > 0;
  }
}
