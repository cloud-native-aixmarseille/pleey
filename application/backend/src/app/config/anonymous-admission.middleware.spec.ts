import { describe, expect, it, vi } from 'vitest';
import { createAnonymousAdmissionMiddleware } from './anonymous-admission.middleware';

describe('createAnonymousAdmissionMiddleware', () => {
  it('allows a supported shared-venue burst below the anonymous source budget', async () => {
    // Arrange
    const store = { increment: vi.fn().mockResolvedValueOnce(500).mockResolvedValueOnce(5000) };
    const middleware = createAnonymousAdmissionMiddleware(store as never);
    const response = {
      json: vi.fn(),
      setHeader: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();

    // Act
    await middleware({ ip: '198.51.100.8' } as never, response as never, next);

    // Assert
    expect(next).toHaveBeenCalledOnce();
    expect(response.status).not.toHaveBeenCalled();
  });

  it('rejects anonymous allocation above the per-source budget', async () => {
    // Arrange
    const middleware = createAnonymousAdmissionMiddleware({
      increment: vi.fn().mockResolvedValueOnce(601).mockResolvedValueOnce(5000),
    } as never);
    const response = {
      json: vi.fn(),
      setHeader: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();

    // Act
    await middleware({ ip: '198.51.100.10' } as never, response as never, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(429);
  });

  it('fails closed when anonymous admission throttling storage is unavailable', async () => {
    // Arrange
    const middleware = createAnonymousAdmissionMiddleware({
      increment: vi.fn().mockRejectedValue(new Error('unavailable')),
    } as never);
    const response = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();

    // Act
    await middleware({ ip: '198.51.100.9' } as never, response as never, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(503);
  });
});
