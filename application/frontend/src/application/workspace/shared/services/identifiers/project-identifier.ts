import type { ProjectId } from '../../../../../domains/project/entities/project';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

export class ProjectIdentifier extends UuidV7IdentifierParser<ProjectId> {
  constructor() {
    super('ProjectId');
  }
}
