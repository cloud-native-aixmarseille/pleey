export function resolvePresentationErrorCode(error: unknown): string | null {
  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return null;
}

export function resolvePresentationErrorMessage(error: unknown, fallbackMessage: string): string {
  return resolvePresentationErrorCode(error) ?? fallbackMessage;
}
