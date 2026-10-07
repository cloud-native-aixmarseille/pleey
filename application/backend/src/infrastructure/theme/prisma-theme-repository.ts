import { Inject, Injectable } from '@nestjs/common';
import { Prisma, type Theme } from '@prisma/client';
import { PaginationQueryNormalizer } from '../../application/shared/services/pagination-query-normalizer';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { ThemeAssetIdentifier } from '../../application/workspace/themes/services/theme-asset-identifier';
import { ThemeDocumentValidator } from '../../application/workspace/themes/services/theme-document-validator';
import { ThemeIdentifier } from '../../application/workspace/themes/services/theme-identifier';
import type { UserId } from '../../domain/identity/entities/user';
import type { OrganizationId } from '../../domain/organization/entities/organization';
import type { PaginationQuery } from '../../domain/shared/value-objects/pagination-query';
import type { ManagedTheme, ThemeAssetId } from '../../domain/theme/entities/managed-theme';
import type { ThemeDocument } from '../../domain/theme/entities/theme-document';
import type { ThemeId } from '../../domain/theme/entities/theme-id';
import { ThemeError, ThemeErrorCode } from '../../domain/theme/errors/theme-error';
import { ThemeRepository } from '../../domain/theme/ports/theme-repository';
import { PrismaService } from '../database/prisma-service';
@Injectable()
export class PrismaThemeRepository implements ThemeRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(PaginationQueryNormalizer) private readonly pagination: PaginationQueryNormalizer,
    @Inject(ThemeIdentifier) private readonly themeIdentifier: ThemeIdentifier,
    @Inject(OrganizationIdentifier) private readonly organizationIdentifier: OrganizationIdentifier,
    @Inject(ThemeAssetIdentifier) private readonly assetIdentifier: ThemeAssetIdentifier,
    @Inject(ThemeDocumentValidator) private readonly validator: ThemeDocumentValidator,
  ) {}
  async findAccess(organizationId: OrganizationId, userId: UserId) {
    const membership = await this.prisma.organizationMember.findFirst({
      where: { organizationId, userId, deletedAt: null, organization: { deletedAt: null } },
      select: { role: true },
    });
    return membership ? { canManage: membership.role === 'owner' || membership.role === 'manager' } : null;
  }
  async findPage(organizationId: OrganizationId, query: PaginationQuery) {
    const pagination = this.pagination.normalizeQuery(query);
    const baseWhere = { organizationId, organization: { deletedAt: null } };
    const where = {
      ...baseWhere,
      ...(pagination.search ? { name: { contains: pagination.search, mode: 'insensitive' as const } } : {}),
    };
    const [overallCount, totalCount, themes] = await this.prisma.$transaction(
      [
        this.prisma.theme.count({ where: baseWhere }),
        this.prisma.theme.count({ where }),
        this.prisma.theme.findMany({
          where,
          orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
          skip: pagination.skip,
          take: pagination.pageSize,
        }),
      ],
      { isolationLevel: 'RepeatableRead' },
    );
    return this.pagination.toPaginatedResult(
      pagination,
      themes.map((theme) => this.toDomain(theme)),
      totalCount,
      overallCount,
    );
  }
  async findById(organizationId: OrganizationId, id: ThemeId) {
    if (!id.startsWith('custom:')) return null;
    const theme = await this.prisma.theme.findFirst({
      where: { id: id.slice(7), organizationId, organization: { deletedAt: null } },
    });
    return theme ? this.toDomain(theme) : null;
  }
  async save(organizationId: OrganizationId, document: ThemeDocument, id?: ThemeId, expectedRevision?: number) {
    const data = { name: document.name, document: document as unknown as Prisma.InputJsonValue };
    try {
      const theme = id
        ? await this.prisma.theme.update({
            where: { id: id.slice(7), organizationId, revision: expectedRevision },
            data: { ...data, revision: { increment: 1 } },
          })
        : await this.prisma.theme.create({ data: { ...data, organizationId } });
      return this.toDomain(theme);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025')
        throw new ThemeError(ThemeErrorCode.REVISION_CONFLICT, { organizationId, id });
      throw error;
    }
  }
  async assetBelongsToOrganization(organizationId: OrganizationId, id: string) {
    return Boolean(
      await this.prisma.themeAsset.findFirst({
        where: { id, organizationId, organization: { deletedAt: null }, media: { deletedAt: null } },
        select: { id: true },
      }),
    );
  }
  async createAsset(organizationId: OrganizationId, image: { content: Uint8Array; width: number; height: number }) {
    const asset = await this.prisma.themeAsset.create({
      data: {
        organization: { connect: { id: organizationId } },
        width: image.width,
        height: image.height,
        media: { create: { mimeType: 'image/webp', content: new Uint8Array(image.content) } },
      },
    });
    return {
      id: this.assetIdentifier.parse(asset.id),
      url: '/api/theme-assets/' + asset.id,
      width: asset.width,
      height: asset.height,
    };
  }
  async findAsset(id: ThemeAssetId) {
    const asset = await this.prisma.themeAsset.findFirst({
      where: { id, media: { deletedAt: null } },
      select: { media: { select: { content: true, mimeType: true } } },
    });
    return asset?.media ?? null;
  }
  private toDomain(theme: Theme): ManagedTheme {
    return {
      id: this.themeIdentifier.parse('custom:' + theme.id),
      organizationId: this.organizationIdentifier.parse(theme.organizationId),
      revision: theme.revision,
      document: this.validator.parse(theme.document),
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
    };
  }
}
