import { Injectable } from '@nestjs/common';
import {
  type OrganizationDashboardStats,
  WorkspaceGameManagementPort,
} from '../../../application/workspace/ports/workspace-game-management.port';
import { PartyStatus } from '../../../domain/game/party/enums/party-status.enum';
import type { OrganizationId } from '../../../domain/organization/entities/organization';
import type { ProjectId } from '../../../domain/project/entities/project';
import { PrismaService } from '../../database/prisma-service';

const ACTIVE_PARTY_STATUSES = [PartyStatus.WAITING, PartyStatus.ACTIVE, PartyStatus.PAUSED];

@Injectable()
export class PrismaWorkspaceGameManagementAdapter extends WorkspaceGameManagementPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async countProjectGames(projectId: ProjectId): Promise<number> {
    return this.prisma.game.count({
      where: {
        projectId,
        deletedAt: null,
      },
    });
  }

  async reassignProjectGames(
    sourceProjectId: ProjectId,
    targetProjectId: ProjectId,
  ): Promise<void> {
    await this.prisma.game.updateMany({
      where: {
        projectId: sourceProjectId,
        deletedAt: null,
      },
      data: {
        projectId: targetProjectId,
      },
    });
  }

  async getOrganizationDashboardStats(
    organizationId: OrganizationId,
  ): Promise<OrganizationDashboardStats> {
    const [totalGames, totalParties, activeParties, totalMembers, totalProjects] =
      await Promise.all([
        this.prisma.game.count({
          where: {
            deletedAt: null,
            project: {
              organizationId,
              deletedAt: null,
              organization: {
                deletedAt: null,
              },
            },
          },
        }),
        this.prisma.party.count({
          where: {
            deletedAt: null,
            game: {
              deletedAt: null,
              project: {
                organizationId,
                deletedAt: null,
                organization: {
                  deletedAt: null,
                },
              },
            },
          },
        }),
        this.prisma.party.count({
          where: {
            deletedAt: null,
            status: {
              in: ACTIVE_PARTY_STATUSES,
            },
            game: {
              deletedAt: null,
              project: {
                organizationId,
                deletedAt: null,
                organization: {
                  deletedAt: null,
                },
              },
            },
          },
        }),
        this.prisma.organizationMember.count({
          where: {
            organizationId,
            deletedAt: null,
            organization: {
              deletedAt: null,
            },
          },
        }),
        this.prisma.project.count({
          where: {
            organizationId,
            deletedAt: null,
            organization: {
              deletedAt: null,
            },
          },
        }),
      ]);

    return {
      totalGames,
      totalParties,
      activeParties,
      totalMembers,
      totalProjects,
    };
  }
}
