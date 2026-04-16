const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users:', users.map(u => ({ id: u.id, username: u.username, role: u.role })));
  
  const testUser = users.find(u => u.username !== 'admin');
  if (testUser) {
    console.log(`Attempting to delete user ${testUser.username} (${testUser.id})...`);
    try {
      await prisma.user.delete({ where: { id: testUser.id } });
      console.log('Delete successful!');
    } catch (err) {
      console.error('Delete failed:', err.message);
    }
  } else {
    console.log('No test user found to delete.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
