import { isDomainError } from '../../../domains/shared/errors/domain-error';

export function resolvePresentationErrorCode(error: unknown): string | null {
  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  if (isDomainError(error)) {
    return error.code;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return null;
}

export function resolvePresentationErrorMessage(error: unknown, fallbackMessage: string): string {
  if (isDomainError(error) && error.message.trim().length > 0) {
    return error.message;
  }

  return resolvePresentationErrorCode(error) ?? fallbackMessage;
}
