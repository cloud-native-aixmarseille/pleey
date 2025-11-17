import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Shared database module exporting the Prisma service
 */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule { }
