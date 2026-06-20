import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { POSClient } from "./pos-client";

export default async function POSPage() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;
  const email = session?.user?.email!;

  const [user, categories, tables] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.category.findMany({
      where: { restaurantId, isActive: true },
      include: {
        menuItems: {
          where: { isAvailable: true },
          include: { variants: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.table.findMany({
      where: { restaurantId },
      orderBy: { number: "asc" },
    }),
  ]);

  return (
    <POSClient
      categories={categories}
      tables={tables}
      restaurantId={restaurantId}
      userId={user?.id || ""}
    />
  );
}
