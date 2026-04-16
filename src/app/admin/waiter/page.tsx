import { prisma } from "@/lib/prisma";
import WaiterClient from "./WaiterClient";
import { auth } from "@/lib/auth";

export default async function WaiterPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const tablesRaw = await prisma.table.findMany({
    include: {
      sessions: {
        where: { 
            status: { in: ["Active", "BillRequested", "ReceiptReady", "CleaningRequired"] as any } 
        },
        include: {
          orders: {
            include: {
              items: { include: { menuItem: true } }
            }
          }
        }
      }
    },
    orderBy: { table_number: "asc" }
  });

  const tables = tablesRaw.map(table => ({
    ...table,
    sessions: table.sessions.map(s => ({
        ...s,
        orders: s.orders.map(o => ({
            ...o,
            items: o.items.map((i: any) => ({
                ...i,
                price_at_time: Number(i.price_at_time),
                cost_at_time: Number(i.cost_at_time),
                menuItem: {
                    ...i.menuItem,
                    price: Number(i.menuItem.price),
                    cost_price: Number(i.menuItem.cost_price)
                }
            }))
        }))
    }))
  }));

  // Get tasks for the Waiter dashboard
  const readyOrdersRaw = await prisma.order.findMany({
    where: { status: "Ready" },
    include: {
      session: { include: { table: true } },
      items: { include: { menuItem: true } }
    }
  });

  const readyOrders = readyOrdersRaw.map(o => ({
    ...o,
    items: o.items.map((i: any) => ({
        ...i,
        price_at_time: Number(i.price_at_time),
        cost_at_time: Number(i.cost_at_time),
        menuItem: {
            ...i.menuItem,
            price: Number(i.menuItem.price),
            cost_price: Number(i.menuItem.cost_price)
        }
    }))
  }));

  const billTasks = await prisma.customerSession.findMany({
    where: { status: "ReceiptReady" as any },
    include: { table: true }
  });

  const cleanTasks = await prisma.customerSession.findMany({
    where: { status: "CleaningRequired" as any },
    include: { table: true }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">شاشة النادل (الويتر)</h1>
          <p className="font-bold text-slate-500">إدارة الطاولات والمهام المطلوبة</p>
        </div>
      </div>

      <WaiterClient 
        userId={userId}
        initialTables={tables} 
        initialReadyOrders={readyOrders}
        initialBillTasks={billTasks}
        initialCleanTasks={cleanTasks}
      />
    </div>
  );
}
