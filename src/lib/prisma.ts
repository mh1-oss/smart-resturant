import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (process.env.NODE_ENV === "production" || process.env.VERCEL || process.env.CF_PAGES) {
  // Use Neon adapter only on Cloudflare/Production
  const { PrismaNeon } = require("@prisma/adapter-neon");
  const { Pool } = require("@neondatabase/serverless");
  
  const connectionString = process.env.DATABASE_URL!;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  
  prismaInstance = new PrismaClient({
    adapter: adapter as any,
    log: ["error"],
  } as any);
} else {
  // Use standard Prisma Client locally
  prismaInstance = new PrismaClient({
    log: ["error"],
  });
}

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
