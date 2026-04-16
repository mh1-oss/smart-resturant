const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Sessions before:', await prisma.customerSession.count());
    
    try {
        await prisma.expense.deleteMany({});
        await prisma.orderItem.deleteMany({}); // Explicitly delete order items just in case
        await prisma.order.deleteMany({}); // explicitly delete orders
        await prisma.customerSession.deleteMany({});
        console.log('Deleted successfully!');
    } catch (e) {
        console.error('Delete error:', e);
    }
    
    console.log('Sessions after:', await prisma.customerSession.count());
}

main().catch(console.error).finally(() => prisma.$disconnect());
