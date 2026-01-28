import { inject, injectable } from 'inversify';
import type { Project } from '../../../../domains/project/entities/project';
import type {
  CreateProjectCommand,
  ProjectRepository,
} from '../../../../domains/project/ports/project-repository';
import { PROJECT_SERVICE_ID } from '../contracts/project-service-id';

@injectable()
export class CreateProjectUseCase {
  constructor(
    @inject(PROJECT_SERVICE_ID.projectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  execute(command: CreateProjectCommand): Promise<Project> {
    return this.projectRepository.createProject(command);
  }
}
