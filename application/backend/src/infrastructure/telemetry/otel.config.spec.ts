import { describe, expect, it } from 'vitest';
import { getLoggerProvider, isTelemetryConsoleLoggingEnabled } from './otel.config';

describe('OpenTelemetry configuration', () => {
  it('requires initialization before creating application loggers', () => {
    // Arrange + Act
    const readProvider = () => getLoggerProvider();

    // Assert
    expect(readProvider).toThrow('OpenTelemetry must be initialized before accessing the logger provider');
  });

  it('requires initialization instead of supplying a console logging default', () => {
    // Arrange + Act
    const readConsoleLogging = () => isTelemetryConsoleLoggingEnabled();

    // Assert
    expect(readConsoleLogging).toThrow('OpenTelemetry must be initialized before reading its configuration');
  });
});
