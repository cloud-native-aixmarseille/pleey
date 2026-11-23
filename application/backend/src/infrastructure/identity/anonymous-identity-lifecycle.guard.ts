import { Injectable } from '@nestjs/common';
import { createDomainError } from '../../domain/shared/errors/domain-error';
import { PrismaService } from '../database/prisma-service';

const RETIRING_IDENTITY_ERROR = {
  code: 'IDENTITY_RETIREMENT_IN_PROGRESS',
  message: 'The temporary identity is no longer allowed to gain authentication authority',
  messageKey: 'IDENTITY_RETIREMENT_IN_PROGRESS',
} as const;

@Injectable()
export class AnonymousIdentityLifecycleGuard {
  constructor(private readonly prisma: PrismaService) {}

  async assertSessionWriteAllowed(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isAnonymous: true,
      },
    });
    if (!user) throw createDomainError(RETIRING_IDENTITY_ERROR, { userId });
    if (!user.isAnonymous) return;
    const retirement = await this.prisma.anonymousRetirement.findFirst({
      where: { sourceUserId: user.id, status: { in: ['PENDING', 'CLAIMED', 'RETRY'] } },
      select: { id: true },
    });
    if (retirement) throw createDomainError(RETIRING_IDENTITY_ERROR, { userId });
  }
}
