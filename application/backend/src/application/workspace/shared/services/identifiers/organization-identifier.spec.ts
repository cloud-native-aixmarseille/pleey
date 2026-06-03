import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { OrganizationIdentifier } from './organization-identifier';

const organizationIdentifier = new OrganizationIdentifier();

describe('OrganizationIdentifier', () => {
  it('builds a branded organization id from a UUIDv7 string', () => {
    const identifier = uuidv7();

    expect(organizationIdentifier.parse(identifier)).toBe(identifier);
  });
});
