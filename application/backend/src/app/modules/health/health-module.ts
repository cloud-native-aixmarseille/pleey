import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaHealthIndicator } from '../../../infrastructure/health/prisma-health-indicator';
import { HealthResolver } from '../../../presentation/health/graphql/health-resolver';
import { HealthController } from '../../../presentation/health/http/health-controller';
import { DatabaseModule } from '../database/database-module';

/**
 * Health module
 * Provides health check endpoints and indicators
 */
@Module({
  imports: [TerminusModule, DatabaseModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator, HealthResolver],
})
export class HealthModule {}
