import { PrismaClient } from '@prisma/client';

async function test() {
  const prisma = new PrismaClient();
  const items = await prisma.menuItem.findMany({
    include: { variants: true, addons: true }
  });
  const item = items.find(i => i.variants.length > 0);
  if (item) {
      console.log("Variant raw price type:", typeof item.variants[0].price);
      console.log("Variant raw price:", item.variants[0].price);
      console.log("Number conversion:", Number(item.variants[0].price));
  }
}
test();
