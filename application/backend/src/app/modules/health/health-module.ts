import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ApplicationHealthIndicator } from '../../../infrastructure/health/application-health-indicator';
import { PrismaHealthIndicator } from '../../../infrastructure/health/prisma-health-indicator';
import { HealthResolver } from '../../../presentation/health/graphql/health-resolver';
import { HealthController } from '../../../presentation/health/http/health-controller';
import { DatabaseModule } from '../database/database-module';

@Module({
  imports: [TerminusModule, DatabaseModule],
  controllers: [HealthController],
  providers: [ApplicationHealthIndicator, PrismaHealthIndicator, HealthResolver],
})
export class HealthModule {}
