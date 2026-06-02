import 'reflect-metadata';
import * as path from 'node:path';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { type INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { I18nJsonLoader, I18nModule } from 'nestjs-i18n';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { GetOrganizationDashboardUseCase } from '../../../application/workspace/dashboard/use-cases/get-organization-dashboard-use-case';
import { AddMemberToOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/add-member-to-organization-use-case';
import { CreateOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/create-organization-use-case';
import { ListOrganizationMembersUseCase } from '../../../application/workspace/organizations/use-cases/list-organization-members-use-case';
import { ListUserOrganizationsUseCase } from '../../../application/workspace/organizations/use-cases/list-user-organizations-use-case';
import { RemoveMemberFromOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/remove-member-from-organization-use-case';
import { UpdateOrganizationMemberRoleUseCase } from '../../../application/workspace/organizations/use-cases/update-organization-member-role-use-case';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-member-identifier';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import { GqlJwtAuthGuard } from '../../identity/shared/guards/gql-jwt-auth-guard';
import { ErrorCodeHttpStatusService } from '../../shared/error-handling/error-code-http-status.service';
import { ERROR_CODE_HTTP_STATUS_RESOLVERS } from '../../shared/error-handling/error-code-http-status-resolvers.token';
import { ERROR_CODE_TRANSLATORS } from '../../shared/error-handling/error-code-translators.token';
import { ErrorTranslationService } from '../../shared/error-handling/error-translation-service';
import { I18nHttpExceptionFilter } from '../../shared/error-handling/i18n-http-exception-filter';
import { OrganizationErrorHttpStatusService } from '../shared/error-handling/organization-error-http-status.service';
import { OrganizationErrorTranslationService } from '../shared/error-handling/organization-error-translation.service';
import { OrganizationResolver } from './organization-resolver';

const addMemberToOrganizationUseCase = {
  execute: vi.fn(),
};

const createOrganizationUseCase = {
  execute: vi.fn(),
};

const listUserOrganizationsUseCase = {
  execute: vi.fn(),
};

const listOrganizationMembersUseCase = {
  execute: vi.fn(),
};

const removeMemberFromOrganizationUseCase = {
  execute: vi.fn(),
};

const updateOrganizationMemberRoleUseCase = {
  execute: vi.fn(),
};

const getOrganizationDashboardUseCase = {
  execute: vi.fn(),
};

const organizationIdentifier = {
  parse: vi.fn((value: number) => value),
};

const organizationMemberIdentifier = {
  parse: vi.fn((value: number) => value),
};

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      context: () => ({ req: { user: { id: 10 } } }),
      driver: ApolloDriver,
      sortSchema: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(process.cwd(), 'src/i18n'),
        watch: false,
      },
    }),
  ],
  providers: [
    OrganizationResolver,
    OrganizationErrorTranslationService,
    OrganizationErrorHttpStatusService,
    {
      provide: CreateOrganizationUseCase,
      useValue: createOrganizationUseCase,
    },
    {
      provide: ListUserOrganizationsUseCase,
      useValue: listUserOrganizationsUseCase,
    },
    {
      provide: ListOrganizationMembersUseCase,
      useValue: listOrganizationMembersUseCase,
    },
    {
      provide: AddMemberToOrganizationUseCase,
      useValue: addMemberToOrganizationUseCase,
    },
    {
      provide: RemoveMemberFromOrganizationUseCase,
      useValue: removeMemberFromOrganizationUseCase,
    },
    {
      provide: UpdateOrganizationMemberRoleUseCase,
      useValue: updateOrganizationMemberRoleUseCase,
    },
    {
      provide: GetOrganizationDashboardUseCase,
      useValue: getOrganizationDashboardUseCase,
    },
    {
      provide: OrganizationIdentifier,
      useValue: organizationIdentifier,
    },
    {
      provide: OrganizationMemberIdentifier,
      useValue: organizationMemberIdentifier,
    },
    {
      provide: ERROR_CODE_TRANSLATORS,
      useFactory: (organizationErrorTranslationService: OrganizationErrorTranslationService) => [
        organizationErrorTranslationService,
      ],
      inject: [OrganizationErrorTranslationService],
    },
    {
      provide: ERROR_CODE_HTTP_STATUS_RESOLVERS,
      useFactory: (organizationErrorHttpStatusService: OrganizationErrorHttpStatusService) => [
        organizationErrorHttpStatusService,
      ],
      inject: [OrganizationErrorHttpStatusService],
    },
    ErrorTranslationService,
    ErrorCodeHttpStatusService,
  ],
})
class TestOrganizationGraphqlModule {}

describe('OrganizationResolver GraphQL integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [TestOrganizationGraphqlModule],
    });

    moduleBuilder.overrideGuard(GqlJwtAuthGuard).useValue({
      canActivate: () => true,
    });

    const moduleRef = await moduleBuilder.compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(
      new I18nHttpExceptionFilter(
        moduleRef.get(ErrorTranslationService),
        moduleRef.get(ErrorCodeHttpStatusService),
      ),
    );
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the translated organization error when adding a missing member by identifier', async () => {
    addMemberToOrganizationUseCase.execute.mockRejectedValueOnce(
      new Error(OrganizationErrorCode.MEMBER_USER_NOT_FOUND),
    );

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation AddOrganizationMember($organizationId: Int!, $input: AddOrganizationMemberInput!) {
          addOrganizationMember(organizationId: $organizationId, input: $input) {
            id
            organizationId
            userId
            username
            role
            joinedAt
          }
        }`,
        variables: {
          organizationId: 7,
          input: {
            usernameOrEmail: 'missing-user',
            role: 'MEMBER',
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeNull();
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'No user matches that username or email',
          path: ['addOrganizationMember'],
          extensions: expect.objectContaining({
            code: OrganizationErrorCode.MEMBER_USER_NOT_FOUND,
          }),
        }),
      ]),
    );
    expect(addMemberToOrganizationUseCase.execute).toHaveBeenCalledWith(
      7,
      {
        role: OrganizationRole.MEMBER,
        usernameOrEmail: 'missing-user',
      },
      10,
    );
    expect(organizationIdentifier.parse).toHaveBeenCalledWith(7);
  });

  it('updates an organization member role', async () => {
    updateOrganizationMemberRoleUseCase.execute.mockResolvedValueOnce({
      id: 18,
      organizationId: 7,
      userId: 42,
      username: 'captain',
      role: OrganizationRole.MANAGER,
      joinedAt: new Date('2026-03-20T10:00:00.000Z'),
    });

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation UpdateOrganizationMemberRole($memberId: Int!, $input: UpdateOrganizationMemberRoleInput!) {
          updateOrganizationMemberRole(memberId: $memberId, input: $input) {
            id
            organizationId
            userId
            username
            role
            joinedAt
          }
        }`,
        variables: {
          memberId: 18,
          input: {
            role: 'MANAGER',
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateOrganizationMemberRole).toEqual(
      expect.objectContaining({
        id: 18,
        organizationId: 7,
        userId: 42,
        username: 'captain',
        role: 'MANAGER',
      }),
    );
    expect(updateOrganizationMemberRoleUseCase.execute).toHaveBeenCalledWith(
      18,
      OrganizationRole.MANAGER,
      10,
    );
  });
});
