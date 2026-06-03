import { type ArgumentMetadata, BadRequestException, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { CreateProjectInput } from '../../../project/graphql/types/create-project-input';
import { ListOrganizationProjectsInput } from '../../../project/graphql/types/list-organization-projects-input';
import { UpdateProjectInput } from '../../../project/graphql/types/update-project-input';

const argumentMetadata: ArgumentMetadata = {
  data: 'input',
  metatype: CreateProjectInput,
  type: 'body',
};

describe('Project GraphQL inputs validation', () => {
  it('accepts create project input with whitelisted properties', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    const result = await pipe.transform(
      {
        description: 'Project scope',
        name: 'Launchpad',
      },
      argumentMetadata,
    );

    expect(result).toBeInstanceOf(CreateProjectInput);
    expect(result).toMatchObject({
      description: 'Project scope',
      name: 'Launchpad',
    });
  });

  it('rejects non-whitelisted properties for create project input', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    await expect(
      pipe.transform(
        {
          name: 'Launchpad',
          slug: 'launchpad',
        },
        argumentMetadata,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts update project input with whitelisted properties', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    const result = await pipe.transform(
      {
        description: 'Expanded scope',
        name: 'Launchpad 2',
      },
      {
        ...argumentMetadata,
        metatype: UpdateProjectInput,
      },
    );

    expect(result).toBeInstanceOf(UpdateProjectInput);
    expect(result).toMatchObject({
      description: 'Expanded scope',
      name: 'Launchpad 2',
    });
  });

  it('accepts list organization projects input with whitelisted properties', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    const result = await pipe.transform(
      {
        organizationId: 7,
        page: 2,
        pageSize: 25,
        search: 'launch',
      },
      {
        ...argumentMetadata,
        metatype: ListOrganizationProjectsInput,
      },
    );

    expect(result).toBeInstanceOf(ListOrganizationProjectsInput);
    expect(result).toMatchObject({
      organizationId: 7,
      page: 2,
      pageSize: 25,
      search: 'launch',
    });
  });
});
