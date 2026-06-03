import { Injectable } from '@nestjs/common';
import type { ProjectId } from '../../../../../domain/project/entities/project';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class ProjectIdentifier extends UuidV7IdentifierParser<ProjectId> {
  constructor() {
    super('ProjectId');
  }
}
