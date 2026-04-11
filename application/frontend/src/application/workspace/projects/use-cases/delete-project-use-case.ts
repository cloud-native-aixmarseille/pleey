import { inject, injectable } from 'inversify';
import type {
  DeleteProjectCommand,
  ProjectRepository,
} from '../../../../domains/project/ports/project-repository';
import { ProjectRepositoryToken } from '../../../../domains/project/ports/project-repository';

@injectable()
export class DeleteProjectUseCase {
  constructor(
    @inject(ProjectRepositoryToken)
    private readonly projectRepository: ProjectRepository,
  ) {}

  execute(command: DeleteProjectCommand): Promise<void> {
    return this.projectRepository.deleteProject(command);
  }
}
