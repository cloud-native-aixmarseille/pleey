import 'reflect-metadata';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import {
  type INestApplication,
  Injectable,
  MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import {
  Args,
  Field,
  GraphQLModule,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { GraphQLUpload, graphqlUploadExpress } from 'graphql-upload-minimal';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { playableContentImportProviders } from '../../../../../application/game/types/shared/services/playable-content-import/import.providers';
import { PlayableContentImportSource } from '../../../../../application/game/types/shared/services/playable-content-import/import-source';
import { PlayableContentImportParser } from '../../../../../application/game/types/shared/services/playable-content-import/playable-content-import-parser';
import { ImportPlayableContentInputBase } from './import-playable-content-inputs';
import {
  DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES,
  PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES_TOKEN,
} from './playable-content-upload.constants';
import { PlayableContentUploadReader } from './playable-content-upload-reader';

const LARGE_CSV_ROW_COUNT = 3000;

function createLargeCsvImportContent(rowCount: number): string {
  const header = 'prompt,correct,timeLimit,points,option1,option2,option3';
  const rows = Array.from({ length: rowCount }, (_, index) =>
    [
      `"Question ${index} repeated prompt text for upload streaming verification"`,
      '1',
      '30',
      '1000',
      `"Option A ${index}"`,
      `"Option B ${index}"`,
      `"Option C ${index}"`,
    ].join(','),
  );

  return [header, ...rows].join('\n');
}

@Injectable()
class PlayableContentImportSourceProbe {
  lastReadAllCalls = 0;
  lastReadLinesCalls = 0;

  wrap(source: PlayableContentImportSource): PlayableContentImportSource {
    this.lastReadAllCalls = 0;
    this.lastReadLinesCalls = 0;

    return new ProbedPlayableContentImportSource(source, this);
  }

  trackReadAll(): void {
    this.lastReadAllCalls += 1;
  }

  trackReadLines(): void {
    this.lastReadLinesCalls += 1;
  }
}

class ProbedPlayableContentImportSource extends PlayableContentImportSource {
  constructor(
    private readonly source: PlayableContentImportSource,
    private readonly probe: PlayableContentImportSourceProbe,
  ) {
    super();
  }

  get fileName(): string {
    return this.source.fileName;
  }

  async readAll(): Promise<string> {
    this.probe.trackReadAll();

    return this.source.readAll();
  }

  readLines(): AsyncIterable<string> {
    this.probe.trackReadLines();

    return this.source.readLines();
  }
}

@InputType()
class TestImportPlayableContentInput extends ImportPlayableContentInputBase {
  @Field(() => Int)
  quizId!: number;
}

@ObjectType()
class TestPlayableContentImportResultType {
  @Field(() => Int)
  importedCount!: number;
}

@Resolver()
class TestPlayableContentImportResolver {
  constructor(
    private readonly parser: PlayableContentImportParser,
    private readonly probe: PlayableContentImportSourceProbe,
    private readonly uploadReader: PlayableContentUploadReader,
  ) {}

  @Query(() => Boolean)
  uploadIntegrationReady(): boolean {
    return true;
  }

  @Mutation(() => TestPlayableContentImportResultType)
  async importPlayableContent(
    @Args('input') input: TestImportPlayableContentInput,
  ): Promise<TestPlayableContentImportResultType> {
    const source = await this.uploadReader.read(input.file);
    const importedItems = await this.parser.parse(this.probe.wrap(source));

    return { importedCount: importedItems.length };
  }
}

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      driver: ApolloDriver,
      resolvers: {
        Upload: GraphQLUpload,
      },
      sortSchema: true,
    }),
  ],
  providers: [
    ...playableContentImportProviders,
    PlayableContentImportSourceProbe,
    {
      provide: PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES_TOKEN,
      useValue: DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES,
    },
    PlayableContentUploadReader,
    TestPlayableContentImportResolver,
  ],
})
class TestPlayableContentImportModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        graphqlUploadExpress({
          maxFileSize: DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES,
          maxFiles: 1,
        }),
      )
      .forRoutes('graphql');
  }
}

describe('PlayableContentUpload GraphQL integration', () => {
  let app: INestApplication;
  let probe: PlayableContentImportSourceProbe;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestPlayableContentImportModule],
    }).compile();

    app = moduleRef.createNestApplication();
    probe = moduleRef.get(PlayableContentImportSourceProbe);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('accepts a large multipart CSV upload through GraphQL and keeps the CSV path streaming', async () => {
    const csvContent = createLargeCsvImportContent(LARGE_CSV_ROW_COUNT);
    const csvSizeBytes = Buffer.byteLength(csvContent, 'utf-8');

    expect(csvSizeBytes).toBeGreaterThan(250_000);
    expect(csvSizeBytes).toBeLessThan(DEFAULT_PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES);

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('apollo-require-preflight', 'true')
      .field(
        'operations',
        JSON.stringify({
          query: `mutation ImportPlayableContent($input: TestImportPlayableContentInput!) {
            importPlayableContent(input: $input) {
              importedCount
            }
          }`,
          variables: {
            input: {
              file: null,
              quizId: 1,
            },
          },
        }),
      )
      .field(
        'map',
        JSON.stringify({
          '0': ['variables.input.file'],
        }),
      )
      .attach('0', Buffer.from(csvContent, 'utf-8'), {
        contentType: 'text/csv',
        filename: 'large-import.csv',
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.importPlayableContent).toEqual({
      importedCount: LARGE_CSV_ROW_COUNT,
    });
    expect(probe.lastReadAllCalls).toBe(0);
    expect(probe.lastReadLinesCalls).toBe(1);
  });
});
