import { Field, InputType } from '@nestjs/graphql';
import { IsDefined } from 'class-validator';
import { GraphQLUpload } from 'graphql-upload-minimal';
import type { GraphqlUploadFile } from '../../../../shared/graphql/graphql-upload-reader';

@InputType({ isAbstract: true })
export abstract class ImportPlayableContentInputBase {
  @Field(() => GraphQLUpload)
  @IsDefined()
  file!: Promise<GraphqlUploadFile>;
}
