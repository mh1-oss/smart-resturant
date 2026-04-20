import { prisma } from "@/lib/prisma";
import MenuClient from "./MenuClient";
import { getSettings } from "@/app/actions/settings";
import { getCustomerOrders, ensureActiveSession } from "@/app/actions/order";

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
        where: { is_available: true }
      }
    },
    orderBy: { id: 'asc' }
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
    menuItems: cat.menuItems.map((item: any) => {
      const itemPrice = Number(item.price);
      const maxDiscount = discountMap.get(item.id) || 0;

      return {
        ...item,
        originalPrice: itemPrice,
        price: maxDiscount > 0 ? (itemPrice * (1 - maxDiscount / 100)) : itemPrice,
        cost_price: Number(item.cost_price || 0),
        discountPercentage: maxDiscount > 0 ? maxDiscount : null
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
