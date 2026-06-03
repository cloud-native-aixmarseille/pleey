import { type ArgumentMetadata, BadRequestException, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { ListOrganizationsInput } from './list-organizations-input';
import { OrganizationMembersInput } from './organization-members-input';

const argumentMetadata: ArgumentMetadata = {
  data: 'input',
  metatype: OrganizationMembersInput,
  type: 'body',
};

describe('Organization GraphQL inputs validation', () => {
  it('accepts organization members input with whitelisted properties', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    const result = await pipe.transform(
      {
        organizationId: 3,
        page: 1,
        pageSize: 25,
      },
      argumentMetadata,
    );

    expect(result).toBeInstanceOf(OrganizationMembersInput);
    expect(result).toMatchObject({
      organizationId: 3,
      page: 1,
      pageSize: 25,
    });
  });

  it('accepts list organizations input with search', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    const result = await pipe.transform(
      {
        page: 2,
        pageSize: 25,
        search: 'pleey',
      },
      {
        ...argumentMetadata,
        metatype: ListOrganizationsInput,
      },
    );

    expect(result).toBeInstanceOf(ListOrganizationsInput);
    expect(result).toMatchObject({
      page: 2,
      pageSize: 25,
      search: 'pleey',
    });
  });

  it('rejects non-whitelisted properties for organization members input', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    await expect(
      pipe.transform(
        {
          organizationId: 3,
          slug: 'should-not-exist',
        },
        argumentMetadata,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
