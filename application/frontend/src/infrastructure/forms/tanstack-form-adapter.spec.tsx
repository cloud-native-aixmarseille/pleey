import { describe, expect, it } from 'vitest';
import { TanstackFormAdapter } from './tanstack-form.adapter';

describe('TanstackFormAdapter', () => {
  describe('createPort()', () => {
    it('returns the form port hooks', () => {
      // Arrange
      const adapter = new TanstackFormAdapter();

      // Act
      const port = adapter.createPort();

      // Assert
      expect(typeof port.useForm).toBe('function');
      expect(typeof port.useFieldContext).toBe('function');
      expect(typeof port.useFormContext).toBe('function');
    });
  });
});
