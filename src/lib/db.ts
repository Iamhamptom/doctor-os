import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

function createPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("noop") || connectionString.includes("placeholder")) {
    console.warn("[db] No real DATABASE_URL configured — DB operations will return demo data");
    return null;
  }
  try {
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ adapter });
  } catch (e) {
    console.warn("[db] Failed to create Prisma client:", e);
    return null;
  }
}

const client = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;

// Export a proxy that returns empty results when DB is not connected
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (client) return (client as unknown as Record<string | symbol, unknown>)[prop];
    // Return a mock model accessor that returns empty results
    return new Proxy({}, {
      get() {
        return async () => {
          console.warn(`[db] DB not connected — ${String(prop)} operation skipped`);
          return null;
        };
      },
    });
  },
});
