import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL || "";
let prisma: PrismaClient;
if (dbUrl.includes("neon.tech")) {
  const adapter = new PrismaNeonHttp(dbUrl, { arrayMode: false, fullResults: false });
  prisma = new PrismaClient({ adapter } as any);
} else {
  const pool = new pg.Pool({ connectionString: dbUrl });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter, log: ["error"] } as any);
}

async function main() {
  console.log("Wiping all restaurant data...\n");

  // Delete in dependency order
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.staffProfile.deleteMany({});
  await prisma.menuInventoryLink.deleteMany({});
  await prisma.variant.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.table.deleteMany({});
  await prisma.otpVerification.deleteMany({});
  await prisma.passwordReset.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.restaurant.deleteMany({});

  const count = await prisma.restaurant.count();
  console.log(`Done. Restaurants remaining: ${count}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
