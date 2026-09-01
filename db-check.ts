import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking RFQs dates...");
  const rfqs = await prisma.rfq.findMany({ select: { id: true, createdAt: true } });
  rfqs.forEach(r => {
    if (!r.createdAt || isNaN(new Date(r.createdAt).getTime())) {
      console.log("Invalid date in RFQ:", r.id);
    }
  });

  console.log("Checking Notifications dates...");
  const notifications = await prisma.notification.findMany({ select: { id: true, createdAt: true } });
  notifications.forEach(n => {
    if (!n.createdAt || isNaN(new Date(n.createdAt).getTime())) {
      console.log("Invalid date in Notification:", n.id);
    }
  });

  console.log("Checking RFQ messages dates...");
  const messages = await prisma.rfqMessage.findMany({ select: { id: true, createdAt: true } });
  messages.forEach(m => {
    if (!m.createdAt || isNaN(new Date(m.createdAt).getTime())) {
      console.log("Invalid date in RFQ Message:", m.id);
    }
  });

  console.log("Check complete.");
}

main()
  .catch((e) => {
    console.error("DB Check failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
