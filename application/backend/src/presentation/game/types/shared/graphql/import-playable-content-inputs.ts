import { Field, InputType } from '@nestjs/graphql';
import { IsDefined } from 'class-validator';
import { GraphQLUpload } from 'graphql-upload-minimal';
import type { PlayableContentUploadFile } from './playable-content-upload-reader';

@InputType({ isAbstract: true })
export abstract class ImportPlayableContentInputBase {
  @Field(() => GraphQLUpload)
  @IsDefined()
  file!: Promise<PlayableContentUploadFile>;
}
