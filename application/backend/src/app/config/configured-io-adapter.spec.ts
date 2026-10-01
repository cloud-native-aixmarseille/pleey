import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../domain/identity/errors';
import { backendTestIdentifiers } from '../../test-utils/branded-identifiers';
import { SocketAuthenticationFixtureFactory } from '../../test-utils/fixtures/unit/socket-authentication-fixture-factory';

describe('ConfiguredIoAdapter', () => {
  it('clears recovered authenticated identity when the reconnect supplies no credentials', async () => {
    // Arrange
    const fixture = new SocketAuthenticationFixtureFactory().create();
    Object.assign(fixture.socket.data, { authenticatedUserId: backendTestIdentifiers.user(1) });

    // Act + Assert
    try {
      await fixture.connect();
      expect(fixture.socket.data).toEqual({});
      expect(fixture.next).toHaveBeenCalledWith();
    } finally {
      fixture.dispose();
    }
  });

  it('keeps unauthenticated guest connections explicit', async () => {
    // Arrange
    const fixture = new SocketAuthenticationFixtureFactory().create();
    // Act + Assert
    try {
      // Act
      await fixture.connect();
      // Assert
      expect(fixture.next).toHaveBeenCalledWith();
      expect(fixture.sessions.authenticate).not.toHaveBeenCalled();
      expect(fixture.socket.data).toEqual({});
    } finally {
      fixture.dispose();
    }
  });

  it.each(['Basic token', '', 42])(
    'rejects malformed credentials rather than creating a guest connection',
    async (authorization) => {
      // Arrange
      const fixture = new SocketAuthenticationFixtureFactory().create(authorization);
      // Act + Assert
      try {
        // Act
        await fixture.connect();
        // Assert
        expect(fixture.next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        expect(fixture.sessions.authenticate).not.toHaveBeenCalled();
      } finally {
        fixture.dispose();
      }
    },
  );

  it('rejects authenticated packets and disconnects after session revocation', async () => {
    // Arrange
    const fixture = new SocketAuthenticationFixtureFactory().create('Bearer access-token');
    const nextPacket = vi.fn();
    // Act + Assert
    try {
      // Act
      await fixture.connect();
      fixture.sessions.authenticate.mockRejectedValueOnce(new UnauthorizedError({ reason: 'revokedSession' }));
      await fixture.socket.use.mock.calls[0][0](['host-control'], nextPacket);
      // Assert
      expect(fixture.socket.data).toEqual({});
      expect(nextPacket).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(fixture.socket.disconnect).toHaveBeenCalledWith(true);
    } finally {
      fixture.dispose();
    }
  });
});
