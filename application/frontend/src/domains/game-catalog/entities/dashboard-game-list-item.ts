export interface DashboardGameSummary {
  readonly translationKey: string;
  readonly values?: Readonly<Record<string, string>>;
}

export interface DashboardGameListItem {
  // Root game id used for live session creation.
  readonly gameId: number;
  readonly type: string;
  readonly title: string;
  readonly description: string | null;
  readonly createdAt: string;
  // Feature-specific id kept explicitly for management boundaries.
  readonly relatedGameId: number | null;
  readonly stageCount: number;
  readonly summary?: DashboardGameSummary | null;
}
