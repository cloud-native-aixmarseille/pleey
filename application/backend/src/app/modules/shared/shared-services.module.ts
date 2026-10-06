import { Module } from '@nestjs/common';
import { PaginationQueryNormalizer } from '../../../application/shared/services/pagination-query-normalizer';
import { GraphqlUploadReader } from '../../../presentation/shared/graphql/graphql-upload-reader';

@Module({
  providers: [PaginationQueryNormalizer, GraphqlUploadReader],
  exports: [PaginationQueryNormalizer, GraphqlUploadReader],
})
export class SharedServicesModule {}
