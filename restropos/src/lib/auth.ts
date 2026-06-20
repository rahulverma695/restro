import { auth as serverAuth } from "./auth/server";
import { prisma, basePrisma } from "./prisma";

export async function auth() {
  const { data: session, error } = await serverAuth.getSession();
  if (error || !session || !session.user) return null;

  // Fetch the associated user and restaurant from our public schema.
  // We use basePrisma to query the DB directly, bypassing the multi-tenant query filter
  // since the tenant filter itself relies on this session mapping.
  const user = await basePrisma.user.findFirst({
    where: { email: session.user.email },
    include: { restaurant: true }
  });

  if (!user) return null;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      restaurantName: user.restaurant.name,
    }
  };
}
