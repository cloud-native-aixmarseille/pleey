import type { ProjectId } from '../../../../../domains/project/entities/project';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

export class ProjectIdentifier extends NumericIdentifierParser<ProjectId> {
  constructor() {
    super('ProjectId');
  }
}
