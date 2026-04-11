import { inject, injectable } from 'inversify';
import type { Project } from '../../../../domains/project/entities/project';
import type {
  CreateProjectCommand,
  ProjectRepository,
} from '../../../../domains/project/ports/project-repository';
import { ProjectRepositoryToken } from '../../../../domains/project/ports/project-repository';

@injectable()
export class CreateProjectUseCase {
  constructor(
    @inject(ProjectRepositoryToken)
    private readonly projectRepository: ProjectRepository,
  ) {}

  execute(command: CreateProjectCommand): Promise<Project> {
    return this.projectRepository.createProject(command);
  }
}
