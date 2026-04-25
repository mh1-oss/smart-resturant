import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Cloudflare Workers provide WebSocket globally, but Node.js does not.
// We only use the adapter if we are surely on Cloudflare or if WebSocket is available.
const isCloudflare = !!process.env.CF_PAGES;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (isCloudflare && connectionString) {
    try {
      // In Cloudflare, we use the Neon adapter which is Edge-compatible
      const pool = new Pool({ connectionString });
      const adapter = new PrismaNeon(pool as any);
      return new PrismaClient({ 
        adapter: adapter as any,
        log: ["error"] 
      } as any);
    } catch (e) {
      console.error("Failed to initialize Prisma with Neon adapter:", e);
      // Fallback to standard client (might only work if not in strict edge)
    }
  }
  
  // Standard client for Local Dev, Vercel (Node runtime), etc.
  return new PrismaClient({ log: ["error"] });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
