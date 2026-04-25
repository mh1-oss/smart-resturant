import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const items = await prisma.menuItem.findMany({
    include: { variants: true, addons: true }
  });
  console.log("Total items:", items.length);
  const itemsWithVariants = items.filter(i => i.variants.length > 0 || i.addons.length > 0);
  console.log("Items with variants/addons:", itemsWithVariants.length);
  if (itemsWithVariants.length > 0) {
      console.log(JSON.stringify(itemsWithVariants[0], null, 2));
  }
}
check().finally(() => prisma.$disconnect());
