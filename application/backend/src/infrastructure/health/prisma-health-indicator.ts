import { Injectable } from '@nestjs/common';
import { type HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { PrismaService } from '../database/prisma-service';

@Injectable()
export class PrismaHealthIndicator {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.prismaService.$queryRaw`SELECT 1`;

      return indicator.up();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Database connection failed';

      return indicator.down({ message });
    }
  }
}
