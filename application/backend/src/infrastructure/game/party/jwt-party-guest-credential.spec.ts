import { JwtService } from '@nestjs/jwt';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { JwtPartyGuestCredential } from './jwt-party-guest-credential';

const subject = {
  partyId: backendTestIdentifiers.party(1),
  guestId: backendTestIdentifiers.guest('guest-1'),
  joinedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('JwtPartyGuestCredential', () => {
  it('binds a proof to the party, guest, and exact join record', () => {
    // Arrange
    const credentials = new JwtPartyGuestCredential(new JwtService(), 'test-signing-key');
    // Act
    const token = credentials.issue(subject);
    // Assert
    expect(credentials.verify(token, subject)).toBe(true);
    expect(credentials.verify(token, { ...subject, guestId: backendTestIdentifiers.guest('guest-2') })).toBe(false);
    expect(credentials.verify(token, { ...subject, partyId: backendTestIdentifiers.party(2) })).toBe(false);
    expect(credentials.verify(token, { ...subject, joinedAt: new Date('2026-01-02T00:00:00Z') })).toBe(false);
    expect(credentials.verify(`${token.slice(0, -5)}wrong`, subject)).toBe(false);
    expect(credentials.verify('', subject)).toBe(false);
  });

  it('expires guest proofs and isolates them from account access tokens', () => {
    // Arrange
    vi.useFakeTimers();
    onTestFinished(() => vi.useRealTimers());
    const jwt = new JwtService();
    const credentials = new JwtPartyGuestCredential(jwt, 'test-signing-key');
    const token = credentials.issue(subject);
    expect(() => jwt.verify(token, { secret: 'test-signing-key' })).toThrow('invalid signature');
    // Act
    vi.advanceTimersByTime(24 * 60 * 60 * 1000);
    // Assert
    expect(credentials.verify(token, subject)).toBe(false);
  });
});
