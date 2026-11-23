import { isIP } from 'node:net';

export function readTrustedProxyCidrs(raw: string): string[] {
  if (!raw.trim()) return [];

  const entries = raw.split(',').map((entry) => entry.trim());
  for (const entry of entries) {
    const [address, prefix, ...extra] = entry.split('/');
    const version = isIP(address);
    const maxPrefix = version === 4 ? 32 : 128;
    if (
      !version ||
      extra.length > 0 ||
      (prefix !== undefined && (!/^\d+$/.test(prefix) || Number(prefix) < 1 || Number(prefix) > maxPrefix))
    ) {
      throw new Error('TRUSTED_PROXY_CIDRS must contain IP addresses or non-universal CIDR networks');
    }
  }
  return entries;
}
