import { describe, expect, it } from 'vitest';
import { readFieldError } from './read-field-error';

describe('readFieldError', () => {
  describe('readFieldError()', () => {
    it('returns the string when the error is a non-empty string', () => {
      expect(readFieldError('Email is required.')).toBe('Email is required.');
    });

    it('returns null when the error is an empty string', () => {
      expect(readFieldError('')).toBeNull();
    });

    it('returns null when the error is a whitespace-only string', () => {
      expect(readFieldError('   ')).toBeNull();
    });

    it('returns the message when the error is an Error instance', () => {
      expect(readFieldError(new Error('Something went wrong'))).toBe('Something went wrong');
    });

    it('returns null when the Error message is empty', () => {
      expect(readFieldError(new Error(''))).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(readFieldError(undefined)).toBeNull();
    });

    it('returns null for null', () => {
      expect(readFieldError(null)).toBeNull();
    });

    it('returns null for a number', () => {
      expect(readFieldError(42)).toBeNull();
    });

    it('returns null for a boolean', () => {
      expect(readFieldError(true)).toBeNull();
    });
  });
});
