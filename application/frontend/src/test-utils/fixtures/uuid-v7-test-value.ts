const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function coerceUuidV7TestValue(value: number | string): string {
  if (typeof value === 'string' && uuidPattern.test(value)) {
    return value.toLowerCase();
  }

  const seed = String(value)
    .replace(/[^a-fA-F0-9]/g, '')
    .padStart(32, '0')
    .slice(-32)
    .toLowerCase();

  return `${seed.slice(0, 8)}-${seed.slice(8, 12)}-7${seed.slice(13, 16)}-8${seed.slice(17, 20)}-${seed.slice(20, 32)}`;
}
