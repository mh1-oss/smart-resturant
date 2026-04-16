import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const chefPassword = await bcrypt.hash("chef123", 10);
  const waiterPassword = await bcrypt.hash("waiter123", 10);

  // Create Admin
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      role: "Admin",
      name: "المدير العام",
    },
  });

  // Create Chef
  await prisma.user.upsert({
    where: { username: "chef" },
    update: {},
    create: {
      username: "chef",
      password: chefPassword,
      role: "Chef",
      name: "رئيس الطهاة",
    },
  });

  // Create Waiter
  await prisma.user.upsert({
    where: { username: "waiter" },
    update: {},
    create: {
      username: "waiter",
      password: waiterPassword,
      role: "Waiter",
      name: "نادل 1",
    },
  });

  console.log("Seed complete: Users created (admin/admin123, chef/chef123, waiter/waiter123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
