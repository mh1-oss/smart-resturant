const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function populateCosts() {
  try {
    console.log("Fetching all menu items...");
    const items = await prisma.menuItem.findMany();
    
    console.log(`Found ${items.length} items. Updating cost prices...`);
    
    for (const item of items) {
      // Set cost price to roughly 65% of the selling price
      const price = Number(item.price);
      const costPrice = price * 0.65;
      
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { cost_price: costPrice }
      });
      console.log(`Updated ${item.name}: Price ${price} -> Cost ${costPrice.toFixed(2)}`);
    }
    
    console.log("Success! All items updated with dummy cost data.");
  } catch (err) {
    console.error("Population error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

populateCosts();
