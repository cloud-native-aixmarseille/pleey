import { inject, injectable } from 'inversify';
import type { Project } from '../../../../domains/project/entities/project';
import type {
  ProjectRepository,
  UpdateProjectCommand,
} from '../../../../domains/project/ports/project-repository';
import { PROJECT_SERVICE_ID } from '../contracts/project-service-id';

@injectable()
export class UpdateProjectUseCase {
  constructor(
    @inject(PROJECT_SERVICE_ID.projectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  execute(command: UpdateProjectCommand): Promise<Project> {
    return this.projectRepository.updateProject(command);
  }
}
