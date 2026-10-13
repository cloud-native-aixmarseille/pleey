import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { ThemeIdentifier } from '../../application/workspace/themes/services/theme-identifier';
import { ThemeDocumentNormalizer } from '../../domains/theme/services/theme-document-normalizer';
import { GraphqlThemeRepository } from '../../infrastructure/theme/graphql-theme-repository';
import { GraphqlClientMockFactory } from '../mocks/graphql-client-mock-factory';

export class GraphqlThemeRepositoryFixtureFactory {
  create(response: unknown) {
    const { client, requestMock } = new GraphqlClientMockFactory().create({ requestResult: response });
    return {
      requestMock,
      repository: new GraphqlThemeRepository(
        client,
        new ThemeDocumentNormalizer(),
        new ThemeIdentifier(),
        new OrganizationIdentifier(),
      ),
    };
  }
}
