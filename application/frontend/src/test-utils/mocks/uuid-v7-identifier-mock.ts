import { coerceUuidV7TestValue } from '../fixtures/uuid-v7-test-value';

type IdentifierParserLike = {
  parse(value: unknown): unknown;
  parseOrNull(value: unknown): unknown;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createIdentifierMock<TParser extends IdentifierParserLike>(
  identifier: TParser,
  shouldCoerceString: (value: string) => boolean,
): TParser {
  const parse = identifier.parse.bind(identifier);
  const parseOrNull = identifier.parseOrNull.bind(identifier);

  const normalize = (value: unknown): unknown => {
    if (typeof value === 'number') {
      if (!Number.isInteger(value) || value <= 0) {
        return value;
      }

      return coerceUuidV7TestValue(value);
    }

    if (typeof value !== 'string') {
      return value;
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length === 0 || uuidPattern.test(trimmedValue)) {
      return value;
    }

    return shouldCoerceString(trimmedValue) ? coerceUuidV7TestValue(trimmedValue) : value;
  };

  return Object.assign(identifier, {
    parse: ((value: unknown) => parse(normalize(value))) as TParser['parse'],
    parseOrNull: ((value: unknown) => parseOrNull(normalize(value))) as TParser['parseOrNull'],
  });
}

export function createNumericUuidV7IdentifierMock<TParser extends IdentifierParserLike>(
  identifier: TParser,
): TParser {
  return createIdentifierMock(identifier, (value) => /^\d+$/.test(value) && Number(value) > 0);
}

export function createGuestUuidV7IdentifierMock<TParser extends IdentifierParserLike>(
  identifier: TParser,
): TParser {
  return createIdentifierMock(
    identifier,
    (value) =>
      (/^\d+$/.test(value) && Number(value) > 0) || value.toLowerCase().startsWith('guest'),
  );
}
