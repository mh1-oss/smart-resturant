import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Detect production or Cloudflare environment
const isEdge = process.env.NODE_ENV === "production" || !!process.env.CF_PAGES;

function createPrismaClient() {
  if (isEdge && process.env.DATABASE_URL) {
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaNeon(pool as any);
      return new PrismaClient({ 
        adapter: adapter as any,
        log: ["error"] 
      } as any);
    } catch (e) {
      console.error("Failed to initialize Prisma with Neon adapter:", e);
      return new PrismaClient({ log: ["error"] });
    }
  }
  
  // Standard client for local development
  return new PrismaClient({ log: ["error"] });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
