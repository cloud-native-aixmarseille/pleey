export interface Quiz {
  readonly id: number;
  readonly gameId: number;
  readonly title: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly questionCount: number;
}
