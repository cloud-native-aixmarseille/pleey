import { describe, expect, it } from 'vitest';
import { GameJoinErrorCode } from '../errors/game-join-error-code';
import { JoinGameFlowService } from './join-game-flow-service';

describe('JoinGameFlowService', () => {
  const service = new JoinGameFlowService();

  it('normalizes pins to trimmed uppercase values', () => {
    expect(service.normalizePin(' ab12cd ')).toBe('AB12CD');
  });

  it('detects whether a pin is complete', () => {
    expect(service.isPinComplete('ab12cd')).toBe(true);
    expect(service.isPinComplete('ab12')).toBe(false);
  });

  it('truncates pins to the expected domain length after normalization', () => {
    expect(service.truncatePin(' ab12cdzz ')).toBe('AB12CD');
  });

  it('sanitizes and validates display names', () => {
    expect(service.sanitizeDisplayName('  Trinity  ')).toBe('Trinity');
    expect(service.hasDisplayName('  Trinity  ')).toBe(true);
    expect(service.hasDisplayName('   ')).toBe(false);
  });

  describe('validatePin', () => {
    it('returns PIN_REQUIRED for empty pin', () => {
      expect(service.validatePin('')).toBe(GameJoinErrorCode.PIN_REQUIRED);
      expect(service.validatePin('   ')).toBe(GameJoinErrorCode.PIN_REQUIRED);
    });

    it('returns PIN_INVALID for incomplete pin', () => {
      expect(service.validatePin('AB1')).toBe(GameJoinErrorCode.PIN_INVALID);
    });

    it('returns null for a valid complete pin', () => {
      expect(service.validatePin('AB12CD')).toBeNull();
    });
  });

  describe('hasPlayerIdentity', () => {
    it('returns true when authenticated', () => {
      expect(service.hasPlayerIdentity(true, '')).toBe(true);
    });

    it('returns true when guest has a non-empty nickname', () => {
      expect(service.hasPlayerIdentity(false, '  Neo  ')).toBe(true);
    });

    it('returns false when not authenticated and no nickname', () => {
      expect(service.hasPlayerIdentity(false, '')).toBe(false);
      expect(service.hasPlayerIdentity(false, '   ')).toBe(false);
    });
  });
});
