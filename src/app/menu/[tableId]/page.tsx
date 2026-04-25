import { prisma } from "@/lib/prisma";
import MenuClient from "./MenuClient";
import { getSettings } from "@/app/actions/settings";
import { getCustomerOrders, ensureActiveSession } from "@/app/actions/order";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ tableId: string }>;
}

export default async function MenuPage({ params }: PageProps) {
  const { tableId } = await params;
  const tableIdNum = parseInt(tableId);
  const settings = await getSettings();
  
  // Session initialization moved to background/client to avoid blocking page load
  
  // Fetch categories and items
  const categoriesRaw = await prisma.category.findMany({
    include: {
      menuItems: {
        where: { is_available: true },
        include: {
          variants: true,
          addons: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Fetch active offers to apply discounts
  const activeOffers = await (prisma as any).offer.findMany({
    where: { is_active: true },
    include: { menuItems: true }
  });

  // Pre-calculate discounts for all items to avoid O(N*M) complexity in the loop
  const discountMap = new Map<number, number>();
  activeOffers.forEach((offer: any) => {
    offer.menuItems.forEach((item: any) => {
      const currentMax = discountMap.get(item.id) || 0;
      if ((offer.discount_percentage || 0) > currentMax) {
        discountMap.set(item.id, offer.discount_percentage || 0);
      }
    });
  });

  // Convert Decimal to Number for serialization compatibility
  const categories = categoriesRaw.map((cat: any) => ({
    ...cat,
    menuItems: [...cat.menuItems]
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
      .map((item: any) => {
        const itemPrice = Number(item.price);
        const maxDiscount = discountMap.get(item.id) || 0;

        return {
          ...item,
          originalPrice: itemPrice,
          price: maxDiscount > 0 ? (itemPrice * (1 - maxDiscount / 100)) : itemPrice,
          cost_price: Number(item.cost_price || 0),
          discountPercentage: maxDiscount > 0 ? maxDiscount : null,
          variants: item.variants.map((v: any) => ({ ...v, price: Number(v.price), cost_price: Number(v.cost_price) })),
          addons: item.addons.map((a: any) => ({ ...a, price: Number(a.price), cost_price: Number(a.cost_price) }))
        };
      })
  }));

  // Fetch initial active orders for the table - MOVED TO CLIENT CONTEXT

  return (
    <div>
      <MenuClient 
        initialCategories={categories} 
        tableId={tableId} 
        currency={settings.currency}
        taxRate={settings.taxRate}
      />
    </div>
  );
}
