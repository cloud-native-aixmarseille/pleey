import { describe, expect, it } from 'vitest';
import { readTrustedProxyCidrs } from './trusted-proxy-cidrs';

describe('readTrustedProxyCidrs', () => {
  it.each(['', '  '])('trusts no proxy when explicitly empty (%s)', (raw) => {
    // Arrange + Act
    const proxies = readTrustedProxyCidrs(raw);
    // Assert
    expect(proxies).toEqual([]);
  });

  it('accepts explicit IPv4 and IPv6 ingress addresses and networks', () => {
    // Arrange
    const raw = ' 10.42.0.0/16,192.0.2.1,2001:db8::/64,::1 ';
    // Act
    const proxies = readTrustedProxyCidrs(raw);
    // Assert
    expect(proxies).toEqual(['10.42.0.0/16', '192.0.2.1', '2001:db8::/64', '::1']);
  });

  it.each([
    'true',
    '*',
    '1',
    'loopback',
    'proxy.example.com',
    '0.0.0.0/0',
    '::/0',
    '10.0.0.1/33',
    '::1/129',
    '10.0.0.1/',
    '10.0.0.1/8/2',
    '10.0.0.1,',
    '10.0.0.1/-1',
  ])('rejects invalid or universal proxy trust (%s)', (raw) => {
    // Arrange + Act + Assert
    expect(() => readTrustedProxyCidrs(raw)).toThrow('TRUSTED_PROXY_CIDRS');
  });
});
