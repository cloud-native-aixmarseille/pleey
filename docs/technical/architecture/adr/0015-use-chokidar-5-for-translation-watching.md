# ADR 0015: Use Chokidar 5 for translation watching

- Status: Proposed
- Proposed date: 2026-10-12
- Accepted date: N/A

## Context

The backend uses `nestjs-i18n` 10.8.5 for translations. Its Chokidar 3.6 dependency brings `braces` 3.0.3 into the production dependency graph. CVE-2026-93687 affects that release, and no patched `braces` release is available. This blocks the Trivy stage of `make ci`.

The translation loader watches a directory with `watch(path, { ignoreInitial: true })`, listens for file events, and closes the watcher on module destruction. It does not pass glob patterns to Chokidar.

## Decision Drivers

- Remove the vulnerable runtime dependency while preserving translation reloads.
- Keep the existing translation library and runtime baseline.
- Keep security checks enabled.

## Considered Options

### Option 1: Wait for an upstream translation-library update

The latest stable `nestjs-i18n` still requires Chokidar 3.6, so a routine update cannot remove the vulnerable dependency.

### Option 2: Override only the translation loader's watcher

Pin Chokidar 5.0.0 under `nestjs-i18n` through npm overrides. The loader uses supported directory-watching APIs and does not need the glob support removed in Chokidar 4. Chokidar 5 is ESM-only and requires Node 20.19 or later, matching the backend's existing engine requirement and its support for loading ESM from CommonJS.

## Decision

Choose option 2. Scope the override to `nestjs-i18n`, retain the current loader, and cover initial loading, file-change reloads, and watcher cleanup with an integration test.

Refresh `proxy-addr` from 2.0.7 to 2.0.8 and `source-map-js` from 1.2.1 to 1.2.2 in the backend lockfile within their existing dependency ranges to address the other Trivy findings.

## Consequences

### Positive

- The production dependency graph no longer includes `braces`.
- Translation loading and watch mode keep their public behavior.
- Security checks remain enabled without suppressing advisories.

### Negative

- The scoped override needs review when the translation loader changes its watcher usage.

### Follow-Up

- Remove the override when `nestjs-i18n` adopts a compatible watcher without `braces`.

## References

Verified 2026-10-12:

- [Chokidar 5 release](https://github.com/paulmillr/chokidar/releases/tag/5.0.0)
- [Chokidar usage and upgrade guidance](https://github.com/paulmillr/chokidar/blob/5.0.0/README.md)
- [Unpatched braces advisory discussion](https://github.com/micromatch/braces/issues/73)
- [proxy-addr advisory and patched version](https://github.com/jshttp/proxy-addr/security/advisories/GHSA-jqcg-44mw-7w3h)
- [source-map-js patched release](https://github.com/7rulnik/source-map-js/releases/tag/v1.2.2)
