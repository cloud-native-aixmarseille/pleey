export function sessionClientLabels(userAgent: string | null) {
  const agent = userAgent ?? '';
  const browser = /Edg(?:e|A|iOS)?\//.test(agent)
    ? 'edge'
    : /(?:OPR|Opera)\//.test(agent)
      ? 'opera'
      : /(?:Firefox|FxiOS)\//.test(agent)
        ? 'firefox'
        : /(?:Chrome|CriOS)\//.test(agent)
          ? 'chrome'
          : /Version\/.*Safari\//.test(agent)
            ? 'safari'
            : 'unknown';
  const system = /Android/.test(agent)
    ? 'android'
    : /iPhone|iPad|iPod/.test(agent)
      ? 'ios'
      : /Windows/.test(agent)
        ? 'windows'
        : /Macintosh|Mac OS X/.test(agent)
          ? 'macos'
          : /Linux/.test(agent)
            ? 'linux'
            : 'unknown';
  return { browser: `auth.profile.sessions.browser.${browser}`, system: `auth.profile.sessions.system.${system}` };
}
