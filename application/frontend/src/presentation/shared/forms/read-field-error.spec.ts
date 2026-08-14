import { describe, expect, it } from 'vitest';
import { readFieldError } from './read-field-error';

describe('readFieldError', () => {
  describe('readFieldError()', () => {
    it('returns the string when the error is a non-empty string', () => {
      // Arrange + Act + Assert
      expect(readFieldError('Email is required.')).toBe('Email is required.');
    });

    it('returns null when the error is an empty string', () => {
      // Arrange + Act + Assert
      expect(readFieldError('')).toBeNull();
    });

    it('returns null when the error is a whitespace-only string', () => {
      // Arrange + Act + Assert
      expect(readFieldError('   ')).toBeNull();
    });

    it('returns the message when the error is an Error instance', () => {
      // Arrange + Act + Assert
      expect(readFieldError(new Error('Something went wrong'))).toBe('Something went wrong');
    });

    it('returns null when the Error message is empty', () => {
      // Arrange + Act + Assert
      expect(readFieldError(new Error(''))).toBeNull();
    });

    it('returns null for undefined', () => {
      // Arrange + Act + Assert
      expect(readFieldError(undefined)).toBeNull();
    });

    it('returns null for null', () => {
      // Arrange + Act + Assert
      expect(readFieldError(null)).toBeNull();
    });

    it('returns null for a number', () => {
      // Arrange + Act + Assert
      expect(readFieldError(42)).toBeNull();
    });

    it('returns null for a boolean', () => {
      // Arrange + Act + Assert
      expect(readFieldError(true)).toBeNull();
    });
  });
});
