import { Module } from '@nestjs/common';
import { PaginationQueryNormalizer } from '../../../application/shared/services/pagination-query-normalizer';

@Module({
  providers: [PaginationQueryNormalizer],
  exports: [PaginationQueryNormalizer],
})
export class SharedServicesModule {}
