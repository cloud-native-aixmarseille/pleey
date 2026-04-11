export type SelectableOptionId<TScope extends string = string> = number & {
  readonly __identifierType: 'SelectableOptionId';
  readonly __identifierBrand: TScope;
};

export interface SelectableOptionInput<TId extends SelectableOptionId = SelectableOptionId> {
  readonly id?: TId;
  readonly text?: string | null;
  readonly position?: number;
  readonly isCorrect?: boolean;
}

export class SelectableOption<TId extends SelectableOptionId = SelectableOptionId> {
  constructor(
    readonly id: TId | null,
    readonly text: string | null,
    readonly position: number,
    readonly isCorrect: boolean,
  ) {}
}
