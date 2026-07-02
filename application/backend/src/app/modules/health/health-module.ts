import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ApplicationHealthIndicator } from '../../../infrastructure/health/application-health-indicator';
import { PrismaHealthIndicator } from '../../../infrastructure/health/prisma-health-indicator';
import { HealthController } from '../../../presentation/health/http/health-controller';
import { AppConfigModule } from '../../config/app-config.module';
import { DatabaseModule } from '../database/database-module';

@Module({
  imports: [TerminusModule, DatabaseModule, AppConfigModule],
  controllers: [HealthController],
  providers: [ApplicationHealthIndicator, PrismaHealthIndicator],
})
export class HealthModule {}
