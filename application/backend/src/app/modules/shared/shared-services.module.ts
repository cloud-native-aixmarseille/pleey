import { Module } from '@nestjs/common';
import { PaginationQueryNormalizer } from '../../../application/shared/services/pagination-query-normalizer';
import { PrismaPartySettingsMapper } from '../../../infrastructure/game/shared/prisma-party-settings.mapper';

@Module({
  providers: [PaginationQueryNormalizer, PrismaPartySettingsMapper],
  exports: [PaginationQueryNormalizer, PrismaPartySettingsMapper],
})
export class SharedServicesModule {}
