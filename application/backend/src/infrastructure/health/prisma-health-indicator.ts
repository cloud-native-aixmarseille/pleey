import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, type HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '../database/prisma-service';

/**
 * Health indicator for Prisma database connection
 * Checks if the database is accessible and responsive
 */
@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  /**
   * Check database health by executing a simple query
   * @param key - The key used in the health check result
   * @returns HealthIndicatorResult with the status
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Execute a simple query to verify database connection
      await this.prismaService.$queryRaw`SELECT 1`;

      return this.getStatus(key, true, {
        message: 'Database connection is healthy',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HealthCheckError(
        'Database health check failed',
        this.getStatus(key, false, {
          message: `Database connection failed: ${message}`,
        }),
      );
    }
  }
}
