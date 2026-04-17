import { getActiveOffers } from "@/app/actions/offer";
import { getSettings } from "@/app/actions/settings";
import OffersView from "../../[tableId]/offers/OffersView";

export default async function DeliveryOffersPage() {
  const settings = await getSettings();
  const result = await getActiveOffers();

  const offers = (result.offers || []).map((offer: any) => ({
    ...offer,
    menuItems: offer.menuItems.map((item: any) => ({
      ...item,
      price: Number(item.price),
      cost_price: Number(item.cost_price || 0)
    }))
  }));

  return (
    <div className="p-6 pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">عروض التوصيل</h1>
        <p className="font-bold text-slate-500">استمتع بأفضل العروض تصلك إلى باب منزلك</p>
      </div>

      <OffersView offers={offers} currency={settings.currency} />
    </div>
  );
}
