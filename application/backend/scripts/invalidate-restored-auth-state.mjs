import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) throw new Error("DATABASE_URL is required");

const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });
let transferCount = 0;

try {
  await prisma.$transaction(async (transaction) => {
    await transaction.session.deleteMany();
    await transaction.verification.deleteMany();
    await transaction.anonymousRetirement.deleteMany();
    const transfers = await transaction.identityTransfer.findMany({
      where: { status: { in: ["PREPARED", "VERIFIED", "APPLYING", "NEEDS_DECISION"] } },
    });
    for (const transfer of transfers) {
      const applied = Object.values(transfer.stepMarkers).some(Boolean);
      await transaction.identityTransfer.update({
        data: {
          failureReason: "RESTORE_INVALIDATED",
          failedAt: new Date(),
          status: applied ? "RESTORE_INVALIDATED_PARTIAL" : "RESTORE_INVALIDATED",
        },
        where: { id: transfer.id },
      });
      transferCount++;
    }
  });
  console.log(`Invalidated restored sessions, verifications and ${transferCount} transfers.`);
} finally {
  await prisma.$disconnect();
}
