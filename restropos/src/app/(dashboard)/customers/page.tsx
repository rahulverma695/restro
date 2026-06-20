import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomersClient } from "./customers-client";

export default async function CustomersPage() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;

  const customers = await prisma.customer.findMany({
    where: { restaurantId },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <CustomersClient customers={customers} restaurantId={restaurantId} />;
}
