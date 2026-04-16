import { prisma } from "@/lib/prisma";
import OffersClient from "./OffersClient";
import { getSettings } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  const settings = await getSettings();
  
  const offersRaw = await (prisma as any).offer.findMany({
    include: {
      menuItems: true,
    },
    orderBy: { created_at: "desc" },
  });

  const menuItemsRaw = await prisma.menuItem.findMany({
    orderBy: { name: "asc" },
  });

  const menuItems = menuItemsRaw.map((item: any) => ({
    ...item,
    price: Number(item.price),
    cost_price: Number(item.cost_price)
  }));

  const offers = offersRaw.map((offer: any) => ({
    ...offer,
    menuItems: offer.menuItems.map((item: any) => ({
      ...item,
      price: Number(item.price),
      cost_price: Number(item.cost_price)
    }))
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">إدارة العروض</h1>
        <p className="font-bold text-slate-500">قم بإنشاء عروض خاصة وخصومات لجذب الزبائن</p>
      </div>
      
      <OffersClient initialOffers={offers} menuItems={menuItems} currency={settings.currency} />
    </div>
  );
}
