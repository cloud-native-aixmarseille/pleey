export interface PromptOptionFormState {
  readonly id?: number;
  readonly position: number;
  readonly text: string;
}

export interface PromptFormState {
  readonly promptText: string;
  readonly options: readonly PromptOptionFormState[];
  readonly correctOptionPosition: number;
  readonly timeLimit: string;
  readonly points: string;
}
