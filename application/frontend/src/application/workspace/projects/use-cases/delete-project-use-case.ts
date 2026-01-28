import { inject, injectable } from 'inversify';
import type {
  DeleteProjectCommand,
  ProjectRepository,
} from '../../../../domains/project/ports/project-repository';
import { PROJECT_SERVICE_ID } from '../contracts/project-service-id';

@injectable()
export class DeleteProjectUseCase {
  constructor(
    @inject(PROJECT_SERVICE_ID.projectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  execute(command: DeleteProjectCommand): Promise<void> {
    return this.projectRepository.deleteProject(command);
  }
}
