import { PrismaClient } from "@prisma/client";
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Detect production or Cloudflare environment
const isEdge = process.env.NODE_ENV === "production" || !!process.env.CF_PAGES;

function createPrismaClient() {
  if (isEdge && process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool as any);
    const config: any = {
      adapter: adapter,
      log: ["error"]
    };
    return new PrismaClient(config);
  }
  
  // Standard client for local development
  return new PrismaClient({ log: ["error"] });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
