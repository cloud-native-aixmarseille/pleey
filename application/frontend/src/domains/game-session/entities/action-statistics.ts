export interface ActionStatistics {
  readonly totalActions: number;
  readonly actionDistribution: Readonly<Record<number, number>>;
}
