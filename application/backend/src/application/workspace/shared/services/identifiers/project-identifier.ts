import { Injectable } from '@nestjs/common';
import type { ProjectId } from '../../../../../domain/project/entities/project';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class ProjectIdentifier extends NumericIdentifierParser<ProjectId> {
  constructor() {
    super('ProjectId');
  }
}
