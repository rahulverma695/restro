import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();
  const restaurantId = (session?.user as any)?.restaurantId;

  const [restaurant, users] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: restaurantId } }),
    prisma.user.findMany({ where: { restaurantId }, select: { id: true, name: true, email: true, role: true } }),
  ]);

  return <SettingsClient restaurant={restaurant} users={users} restaurantId={restaurantId} />;
}
