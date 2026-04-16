const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const sessions = await prisma.customerSession.findMany({
    include: { table: true }
  });
  console.log("Sessions Count:", sessions.length);
  sessions.forEach(s => {
    console.log(`Table ${s.table.table_number}: ${s.status}`);
  });
  await prisma.$disconnect();
}

check();
