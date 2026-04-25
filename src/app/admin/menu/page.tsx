import { prisma } from "@/lib/prisma";
import MenuManagementClient from "./MenuManagementClient";
import { getSettings } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const settings = await getSettings();
  
  const categoriesRaw = await prisma.category.findMany({
    include: {
      menuItems: {
        include: {
          variants: true,
          addons: true
        }
      },
    },
    orderBy: { id: "asc" },
  });

  // Convert Decimal to Number for serialization
  const categories = categoriesRaw.map(cat => ({
    ...cat,
    menuItems: cat.menuItems.map((item: any) => ({
      ...item,
      price: Number(item.price),
      cost_price: Number(item.cost_price || 0),
      variants: item.variants.map((v: any) => ({ ...v, price: Number(v.price), cost_price: Number(v.cost_price) })),
      addons: item.addons.map((a: any) => ({ ...a, price: Number(a.price), cost_price: Number(a.cost_price) }))
    }))
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة القائمة</h1>
          <p className="font-bold text-slate-500">تحكم في التصنيفات والوجبات المتاحة للزبائن</p>
        </div>
      </div>
      
      <MenuManagementClient initialCategories={categories} currency={settings.currency} />
    </div>
  );
}
