import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeliveryClient from "./DeliveryClient";
import { getSettings } from "@/app/actions/settings";

export default async function DeliveryPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user as any;
  if (user.role !== "Admin" && user.role !== "DeliveryDriver") {
    redirect("/admin/dashboard");
  }

  const settings = await getSettings();

  const [availableOrdersRaw, myActiveOrdersRaw] = await Promise.all([
    (prisma as any).order.findMany({
      where: { 
        type: "Delivery",
        status: "Ready",
        driver_id: null
      },
      include: { 
        items: { include: { menuItem: true } } 
      },
      orderBy: { created_at: "asc" }
    }),
    (prisma as any).order.findMany({
      where: { 
        driver_id: user.id,
        status: "Shipped"
      },
      include: { 
        items: { include: { menuItem: true } } 
      },
      orderBy: { created_at: "asc" }
    })
  ]);

  const formatOrders = (orders: any[]) => orders.map(o => ({
    ...o,
    items: o.items.map((i: any) => ({
      ...i,
      price_at_time: Number(i.price_at_time),
      cost_at_time: Number(i.cost_at_time),
      menuItem: i.menuItem ? {
        ...i.menuItem,
        price: Number(i.menuItem.price),
        cost_price: Number(i.menuItem.cost_price)
      } : null
    }))
  }));

  return (
    <DeliveryClient 
      driverId={user.id}
      driverName={user.name || "سائق"}
      initialAvailableOrders={formatOrders(availableOrdersRaw)}
      initialMyOrders={formatOrders(myActiveOrdersRaw)}
      currency={settings.currency}
    />
  );
}
