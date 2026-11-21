import { ProjectIdentifier } from '../../application/workspace/shared/services/identifiers/project-identifier';
import { createNumericUuidV7IdentifierMock } from './uuid-v7-identifier-mock';

export class ProjectIdentifierMockFactory {
  create() {
    return createNumericUuidV7IdentifierMock(new ProjectIdentifier());
  }
}
