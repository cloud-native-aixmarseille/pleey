import { describe, expect, it } from 'vitest';
import { PIN } from './pin.vo';

describe('PIN Value Object', () => {
  describe('constructor', () => {
    it('should create a PIN with valid 6-digit value', () => {
      const pin = new PIN('123456');
      expect(pin.getValue()).toBe('123456');
    });

    it('should throw error for non-numeric PIN', () => {
      expect(() => new PIN('abcdef')).toThrow('PIN must be exactly 6 digits');
    });

    it('should throw error for PIN shorter than 6 digits', () => {
      expect(() => new PIN('12345')).toThrow('PIN must be exactly 6 digits');
    });

    it('should throw error for PIN longer than 6 digits', () => {
      expect(() => new PIN('1234567')).toThrow('PIN must be exactly 6 digits');
    });

    it('should throw error for empty string', () => {
      expect(() => new PIN('')).toThrow('PIN must be exactly 6 digits');
    });

    it('should throw error for PIN with special characters', () => {
      expect(() => new PIN('12-456')).toThrow('PIN must be exactly 6 digits');
    });

    it('should throw error for PIN with spaces', () => {
      expect(() => new PIN('123 456')).toThrow('PIN must be exactly 6 digits');
    });
  });

  describe('getValue', () => {
    it('should return the PIN value', () => {
      const pin = new PIN('987654');
      expect(pin.getValue()).toBe('987654');
    });
  });

  describe('equals', () => {
    it('should return true for equal PINs', () => {
      const pin1 = new PIN('123456');
      const pin2 = new PIN('123456');
      expect(pin1.equals(pin2)).toBe(true);
    });

    it('should return false for different PINs', () => {
      const pin1 = new PIN('123456');
      const pin2 = new PIN('654321');
      expect(pin1.equals(pin2)).toBe(false);
    });

    it('should be symmetric', () => {
      const pin1 = new PIN('111111');
      const pin2 = new PIN('111111');
      expect(pin1.equals(pin2)).toBe(pin2.equals(pin1));
    });
  });

  describe('generate', () => {
    it('should generate a valid 6-digit PIN', () => {
      const pin = PIN.generate();
      expect(pin.getValue()).toMatch(/^\d{6}$/);
    });

    it('should generate different PINs', () => {
      const pins = new Set<string>();
      for (let i = 0; i < 100; i++) {
        pins.add(PIN.generate().getValue());
      }
      // Should have at least some variety (not all the same)
      expect(pins.size).toBeGreaterThan(1);
    });

    it('should generate PINs between 100000 and 999999', () => {
      for (let i = 0; i < 10; i++) {
        const pin = PIN.generate();
        const value = Number.parseInt(pin.getValue(), 10);
        expect(value).toBeGreaterThanOrEqual(100000);
        expect(value).toBeLessThanOrEqual(999999);
      }
    });
  });
});
