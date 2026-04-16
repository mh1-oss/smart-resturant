const { deleteCategory } = require('../src/app/actions/menu');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  // Find a category that has items
  const category = await prisma.category.findFirst({
    where: { menuItems: { some: {} } }
  });

  if (!category) {
    console.log('No category with items found for testing.');
    return;
  }

  console.log(`Testing deletion of category "${category.name}" (ID: ${category.id})...`);
  const result = await deleteCategory(category.id);
  console.log('Result:', result);
  
  if (result.success === false && result.error.includes('الوجبات')) {
    console.log('Success: Correct error message returned!');
  } else {
    console.log('Failure: Unexpected result or error message.');
  }
}

test().catch(console.error).finally(() => prisma.$disconnect());
