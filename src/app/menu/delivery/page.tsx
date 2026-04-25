import { prisma } from "@/lib/prisma";
import MenuClient from "../[tableId]/MenuClient";
import { getSettings } from "@/app/actions/settings";
import { getDeliveryOrders } from "@/app/actions/order";

export default async function DeliveryMenuPage() {
  const settings = await getSettings();
  
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

  // Convert Decimal to Number for serialization compatibility
  const categories = categoriesRaw.map((cat: any) => ({
    ...cat,
    menuItems: [...cat.menuItems]
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
      .map((item: any) => {
      const itemPrice = Number(item.price);
      // Find the best discount percentage from active offers for this item
      const applicableOffers = activeOffers.filter((o: any) => 
        o.menuItems.some((mi: any) => mi.id === item.id)
      );
      
      const maxDiscount = applicableOffers.reduce((max: number, offer: any) => 
        Math.max(max, offer.discount_percentage || 0), 0
      );

      return {
        ...item,
        originalPrice: itemPrice,
        price: maxDiscount > 0 ? (itemPrice * (1 - maxDiscount / 100)) : itemPrice,
        cost_price: Number(item.cost_price || 0),
        discountPercentage: maxDiscount > 0 ? maxDiscount : null,
        variants: item.variants.map((v: any) => ({
          ...v,
          price: Number(v.price),
          cost_price: Number(v.cost_price)
        })),
        addons: item.addons.map((a: any) => ({
          ...a,
          price: Number(a.price),
          cost_price: Number(a.cost_price)
        }))
      };
    })
  }));

  // For delivery, we don't have a tableId to pass to MenuClient, but MenuClient takes it as a prop.
  // We'll pass a dummy or empty tableId.
  
  return (
    <div>
      <MenuClient 
        initialCategories={categories} 
        tableId="delivery" 
        currency={settings.currency}
        taxRate={settings.taxRate}
      />
    </div>
  );
}
