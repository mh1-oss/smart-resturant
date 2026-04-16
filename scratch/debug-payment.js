const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugUpdate() {
  try {
    const session = await prisma.customerSession.findFirst({
      where: { status: "ReceiptReady" },
      include: { table: true }
    });

    if (!session) {
      console.log("No session found with status ReceiptReady");
      return;
    }

    console.log(`Found session ID: ${session.id} for Table: ${session.table.table_number}`);
    
    try {
      console.log("Attempting to update to CleaningRequired...");
      const updated = await prisma.customerSession.update({
        where: { id: session.id },
        data: { status: "CleaningRequired" }
      });
      console.log("Success! New status:", updated.status);
    } catch (updateError) {
      console.error("Update failed with error:", updateError.message);
      if (updateError.code) console.log("Prisma Error Code:", updateError.code);
    }

  } catch (err) {
    console.error("Debug script error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

debugUpdate();
