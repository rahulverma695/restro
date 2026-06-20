import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { auth } from "@/lib/auth/server";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

async function getRestaurantIdFromSession(): Promise<string | null> {
  try {
    const { data: session, error } = await auth.getSession();
    if (error || !session || !session.user?.email) return null;

    const user = await basePrisma.user.findFirst({
      where: { email: session.user.email },
      select: { restaurantId: true }
    });

    return user?.restaurantId || null;
  } catch {
    // Session is unavailable during build-time, seed scripts, or CLI context.
    return null;
  }
}

const tenantModels = [
  "User",
  "Table",
  "Category",
  "MenuItem",
  "Order",
  "InventoryItem",
  "StaffProfile",
  "Customer",
  "Offer",
  "Reservation"
];

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (typeof window === "undefined") {
    neonConfig.webSocketConstructor = ws;
  }
  const adapter = new PrismaNeon({ connectionString: dbUrl });
  return new PrismaClient({ adapter, log: ["error"] } as any);
}

export const basePrisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const restaurantId = await getRestaurantIdFromSession();

        // If no restaurantId is available in the session, bypass the security filters
        if (!restaurantId) {
          return query(args);
        }

        const modelArgs = args as any;

        // Apply tenant-isolation to tenant-specific models
        if (tenantModels.includes(model)) {
          if (
            operation === "findFirst" ||
            operation === "findFirstOrThrow" ||
            operation === "findMany" ||
            operation === "count" ||
            operation === "aggregate" ||
            operation === "groupBy"
          ) {
            modelArgs.where = {
              ...modelArgs.where,
              restaurantId,
            };
            return query(modelArgs);
          }

          if (operation === "findUnique" || operation === "findUniqueOrThrow") {
            const newArgs = {
              ...modelArgs,
              where: {
                ...modelArgs.where,
                restaurantId,
              },
            } as any;
            if (operation === "findUnique") {
              return (basePrisma[model as any] as any).findFirst(newArgs);
            } else {
              return (basePrisma[model as any] as any).findFirstOrThrow(newArgs);
            }
          }

          if (operation === "create") {
            modelArgs.data = {
              ...modelArgs.data,
              restaurantId,
            };
            return query(modelArgs);
          }

          if (operation === "createMany") {
            if (Array.isArray(modelArgs.data)) {
              modelArgs.data = modelArgs.data.map((item: any) => ({
                ...item,
                restaurantId,
              }));
            } else if (modelArgs.data) {
              modelArgs.data = {
                ...modelArgs.data,
                restaurantId,
              };
            }
            return query(modelArgs);
          }

          if (operation === "update" || operation === "delete") {
            // Pre-check on the base client to verify record ownership
            const exists = await (basePrisma[model as any] as any).findFirst({
              where: { ...modelArgs.where, restaurantId },
            });
            if (!exists) {
              throw new Error(
                `Unauthorized: Record in ${model} does not exist or does not belong to your restaurant.`
              );
            }
            return query(modelArgs);
          }

          if (operation === "updateMany" || operation === "deleteMany") {
            modelArgs.where = {
              ...modelArgs.where,
              restaurantId,
            };
            return query(modelArgs);
          }

          if (operation === "upsert") {
            const exists = await (basePrisma[model as any] as any).findFirst({
              where: { ...modelArgs.where, restaurantId },
            });
            if (exists) {
              return (basePrisma[model as any] as any).update({
                where: modelArgs.where,
                data: modelArgs.update,
              });
            } else {
              return (basePrisma[model as any] as any).create({
                data: {
                  ...modelArgs.create,
                  restaurantId,
                },
              });
            }
          }
        }

        // Apply tenant-isolation to Restaurant model direct queries
        if (model === "Restaurant") {
          if (
            operation === "findFirst" ||
            operation === "findFirstOrThrow" ||
            operation === "findMany" ||
            operation === "count" ||
            operation === "aggregate" ||
            operation === "groupBy"
          ) {
            modelArgs.where = {
              ...modelArgs.where,
              id: restaurantId,
            };
            return query(modelArgs);
          }

          if (operation === "findUnique" || operation === "findUniqueOrThrow") {
            modelArgs.where = {
              ...modelArgs.where,
              id: restaurantId,
            };
            return query(modelArgs);
          }

          if (operation === "update" || operation === "delete") {
            if (modelArgs.where?.id !== restaurantId) {
              throw new Error(
                `Unauthorized: You cannot modify another restaurant's configuration.`
              );
            }
            return query(modelArgs);
          }

          if (operation === "updateMany" || operation === "deleteMany") {
            modelArgs.where = {
              ...modelArgs.where,
              id: restaurantId,
            };
            return query(modelArgs);
          }

          if (operation === "upsert") {
            if (modelArgs.where?.id !== restaurantId) {
              throw new Error(
                `Unauthorized: You cannot upsert another restaurant's configuration.`
              );
            }
            return query(modelArgs);
          }
        }

        return query(modelArgs);
      },
    },
  },
});

