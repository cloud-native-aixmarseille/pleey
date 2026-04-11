import { describe, expect, it } from 'vitest';
import { OrganizationIdentifier } from './organization-identifier';

const organizationIdentifier = new OrganizationIdentifier();

describe('OrganizationIdentifier', () => {
  it('builds a branded organization id from a number', () => {
    expect(organizationIdentifier.parse(3)).toBe(3);
  });
});
