export interface Quiz {
  id: number;
  title: string;
  description: string | null;
  created_by: number;
  organizationId?: number;
  created_at: string;
  question_count?: number;
  is_active?: boolean;
}
