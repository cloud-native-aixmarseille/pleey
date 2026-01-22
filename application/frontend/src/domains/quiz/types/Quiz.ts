export interface Quiz {
  id: number;
  title: string;
  description: string | null;
  createdById: number;
  organizationId?: number;
  createdAt: string;
  questionCount?: number;
  isActive?: boolean;
}
