import { vi } from 'vitest';
import { PaginationQueryNormalizer } from '../../application/shared/services/pagination-query-normalizer';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { ThemeAssetIdentifier } from '../../application/workspace/themes/services/theme-asset-identifier';
import { ThemeDocumentValidator } from '../../application/workspace/themes/services/theme-document-validator';
import { ThemeIdentifier } from '../../application/workspace/themes/services/theme-identifier';
import { ThemeDocumentNormalizer } from '../../domain/theme/services/theme-document-normalizer';
import type { PrismaService } from '../../infrastructure/database/prisma-service';
import { PrismaThemeRepository } from '../../infrastructure/theme/prisma-theme-repository';
export class PrismaThemeRepositoryFixtureFactory {
  create() {
    const prisma = {
      theme: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]), update: vi.fn() },
      $transaction: vi.fn((operations: readonly Promise<unknown>[]) => Promise.all(operations)),
    };
    const repository = new PrismaThemeRepository(
      prisma as unknown as PrismaService,
      new PaginationQueryNormalizer(),
      new ThemeIdentifier(),
      new OrganizationIdentifier(),
      new ThemeAssetIdentifier(),
      new ThemeDocumentValidator(new ThemeDocumentNormalizer()),
    );
    return { prisma, repository };
  }
}
