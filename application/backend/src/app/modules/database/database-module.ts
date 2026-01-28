import { Module } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma-service';
import { AppConfigModule } from '../../config/app-config.module';

/**
 * Shared database module exporting the Prisma service
 */
@Module({
  imports: [AppConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
