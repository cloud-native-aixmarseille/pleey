export interface StageResultDistributionItem {
  readonly id: number;
  readonly text: string;
  readonly isCorrect: boolean;
  readonly isSelected: boolean;
  readonly actionCount: number;
  readonly actionPercent: number;
}
