import { describe, expect, it, vi } from 'vitest';
import { IdentityTransferService } from './identity-transfer.service';

const input = {
  sourceSessionId: 'source-session',
  sourceUserId: 'source-user',
  targetSessionId: 'target-session',
  targetUserId: 'target-user',
};

function createTransaction() {
  return {
    identityTransfer: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: 'transfer-1' }),
      update: vi.fn().mockResolvedValue({}),
    },
    partyParticipant: {
      findMany: vi.fn().mockResolvedValue([{ id: 'participant-1', partyId: 'party-1' }]),
      findUnique: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    score: { updateMany: vi.fn().mockResolvedValue({ count: 2 }) },
    session: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
    userParticipationClaim: {
      delete: vi.fn(),
      findUnique: vi
        .fn()
        .mockResolvedValueOnce({ partyId: 'party-1', userId: input.sourceUserId })
        .mockResolvedValueOnce(null),
      update: vi.fn().mockResolvedValue({}),
    },
  };
}

describe('IdentityTransferService', () => {
  it('moves durable participants and scores before revoking the anonymous session', async () => {
    // Arrange
    const transaction = createTransaction();
    const prisma = {
      $transaction: vi.fn(async (work: (client: typeof transaction) => Promise<void>) => work(transaction)),
    };
    const service = new IdentityTransferService(prisma as never);

    // Act
    await service.transfer(input);

    // Assert
    expect(transaction.partyParticipant.updateMany).toHaveBeenCalledWith({
      data: { userId: input.targetUserId },
      where: { userId: input.sourceUserId },
    });
    expect(transaction.score.updateMany).toHaveBeenCalledWith({
      data: { userId: input.targetUserId },
      where: { userId: input.sourceUserId },
    });
    expect(transaction.session.deleteMany).toHaveBeenCalledWith({ where: { id: input.sourceSessionId } });
    expect(transaction.identityTransfer.update).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'COMPLETED' }),
      where: { id: 'transfer-1' },
    });
  });

  it('rejects target participation collisions without moving ownership', async () => {
    // Arrange
    const transaction = createTransaction();
    transaction.userParticipationClaim.findUnique
      .mockReset()
      .mockResolvedValueOnce({ partyId: 'party-1', userId: input.sourceUserId })
      .mockResolvedValueOnce({ partyId: 'party-2', userId: input.targetUserId });
    const prisma = {
      $transaction: vi.fn(async (work: (client: typeof transaction) => Promise<void>) => work(transaction)),
    };
    const service = new IdentityTransferService(prisma as never);

    // Act + Assert
    await expect(service.transfer(input)).rejects.toThrow('IDENTITY_TRANSFER_COLLISION');
    expect(transaction.partyParticipant.updateMany).not.toHaveBeenCalled();
    expect(transaction.session.deleteMany).not.toHaveBeenCalled();
  });

  it('is idempotent after a completed linked identity operation', async () => {
    // Arrange
    const transaction = createTransaction();
    transaction.identityTransfer.findUnique.mockResolvedValue({ status: 'COMPLETED' });
    const prisma = {
      $transaction: vi.fn(async (work: (client: typeof transaction) => Promise<void>) => work(transaction)),
    };
    const service = new IdentityTransferService(prisma as never);

    // Act
    await service.transfer(input);

    // Assert
    expect(transaction.partyParticipant.findMany).not.toHaveBeenCalled();
    expect(transaction.identityTransfer.upsert).not.toHaveBeenCalled();
  });
});
