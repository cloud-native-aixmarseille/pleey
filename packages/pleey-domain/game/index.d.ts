export interface SharedQuestionMediaPolicy {
  readonly acceptedMimeTypes: readonly string[];
  readonly maxFileSizeBytes: number;
}

export const SHARED_QUESTION_MEDIA_POLICY: SharedQuestionMediaPolicy;
