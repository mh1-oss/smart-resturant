import { prisma } from "@/lib/prisma";
import KitchenClient from "./KitchenClient";

export default async function KitchenPage() {
  const ordersRaw = await prisma.order.findMany({
    where: {
      status: {
        in: ["Pending", "Preparing", "Ready"] as any
      }
    },
    include: {
      session: {
        include: { table: true }
      },
      items: {
        include: { menuItem: true }
      }
    },
    orderBy: { created_at: "asc" }
  });

  // Convert Decimals to Numbers for serialization
  const orders = ordersRaw.map(order => ({
    ...order,
    items: order.items.map((item: any) => ({
      ...item,
      price_at_time: Number(item.price_at_time),
      cost_at_time: Number(item.cost_at_time),
      menuItem: item.menuItem ? {
        ...item.menuItem,
        price: Number(item.menuItem.price),
        cost_price: Number(item.menuItem.cost_price)
      } : null
    }))
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">شاشة المطبخ</h1>
          <p className="font-bold text-slate-500">مراقبة وتجهيز طلبات الزبائن الحالية</p>
        </div>
      </div>

      <KitchenClient initialOrders={orders} />
    </div>
  );
}
