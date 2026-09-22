import { describe, expect, it } from 'vitest';
import { sessionClientLabels } from './session-client-labels';

describe('sessionClientLabels', () => {
  it.each([
    ['Windows NT 10.0 Chrome/140 Safari/537 Edg/140', 'edge', 'windows'],
    ['Android Chrome/140 Safari/537 OPR/100', 'opera', 'android'],
    ['iPhone Mac OS X CriOS/140 Mobile Safari/604', 'chrome', 'ios'],
    ['iPad Mac OS X FxiOS/140 Safari/604', 'firefox', 'ios'],
    ['Macintosh Version/18.0 Safari/605', 'safari', 'macos'],
    ['X11; Linux x86_64 Firefox/140', 'firefox', 'linux'],
    [null, 'unknown', 'unknown'],
    ['unrecognized client', 'unknown', 'unknown'],
  ])('uses informational client hints from %s', (agent, browser, system) => {
    // Act
    const labels = sessionClientLabels(agent);
    // Assert
    expect(labels).toEqual({
      browser: `auth.profile.sessions.browser.${browser}`,
      system: `auth.profile.sessions.system.${system}`,
    });
  });
});
