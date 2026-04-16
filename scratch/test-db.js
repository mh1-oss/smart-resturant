const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing DB connection...');
  try {
    const start = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('DB Connection successful:', result);
    console.log('Time taken:', Date.now() - start, 'ms');
  } catch (err) {
    console.error('DB Connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
