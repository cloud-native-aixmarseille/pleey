import { type ArgumentMetadata, BadRequestException, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { ListOrganizationsInput } from './list-organizations-input';
import { OrganizationMembersInput } from './organization-members-input';

const argumentMetadata: ArgumentMetadata = {
  data: 'input',
  metatype: OrganizationMembersInput,
  type: 'body',
};

describe('Organization GraphQL inputs validation', () => {
  it('accepts organization members input with whitelisted properties', async () => {
    // Arrange
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    // Act
    const result = await pipe.transform(
      {
        organizationId: backendTestIdentifiers.organization(3),
        page: 1,
        pageSize: 25,
      },
      argumentMetadata,
    );

    // Assert
    expect(result).toBeInstanceOf(OrganizationMembersInput);
    expect(result).toMatchObject({
      organizationId: backendTestIdentifiers.organization(3),
      page: 1,
      pageSize: 25,
    });
  });

  it('accepts list organizations input with search', async () => {
    // Arrange
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    // Act
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

    // Assert
    expect(result).toBeInstanceOf(ListOrganizationsInput);
    expect(result).toMatchObject({
      page: 2,
      pageSize: 25,
      search: 'pleey',
    });
  });

  it('rejects non-whitelisted properties for organization members input', async () => {
    // Arrange
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    // Act + Assert
    await expect(
      pipe.transform(
        {
          organizationId: backendTestIdentifiers.organization(3),
          slug: 'should-not-exist',
        },
        argumentMetadata,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
