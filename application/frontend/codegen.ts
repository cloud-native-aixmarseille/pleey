import type { CodegenConfig } from '@graphql-codegen/cli';

const schemaSource = process.env.CODEGEN_SCHEMA ?? '../backend/src/schema.gql';

const config: CodegenConfig = {
  schema: schemaSource,
  documents: ['src/infrastructure/**/graphql/operations/**/*.graphql'],
  generates: {
    'src/infrastructure/graphql/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        scalars: {
          DateTime: 'string',
        },
        useTypeImports: true,
      },
    },
  },
  ignoreNoDocuments: false,
};

export default config;
