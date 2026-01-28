export interface Project {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly organizationId: number;
  readonly createdAt: string;
}
