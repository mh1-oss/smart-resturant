import { UtensilsCrossed, Truck } from "lucide-react";
import { getSettings } from "@/app/actions/settings";
import MenuDeliveryLayoutClient from "./MenuDeliveryLayoutClient";
import { OrderProvider } from "@/context/OrderContext";
import { CartProvider } from "@/context/CartContext";

export default async function DeliveryLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <CartProvider>
      <OrderProvider>
        <div className="min-h-screen bg-[#f8fafc] pb-24 text-right" dir="rtl">
          {/* App Header */}
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-none transition-all duration-300">
            <div className="mx-auto max-w-3xl px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 relative">
              {/* Right Side (Logo) */}
              <div className="flex-1 flex justify-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20 shrink-0">
                  <Truck className="h-6 w-6" />
                </div>
              </div>

              {/* True Center Action (Empty for Delivery top, or could be status) */}
              <div className="flex justify-center shrink-0">
                <div className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                  خدمة التوصيل
                </div>
              </div>

              {/* Left Side (Branding) */}
              <div className="flex-1 flex flex-col items-end text-left min-w-0">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight truncate w-full">{settings.restaurantName}</h1>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate w-full">التوصيل للمنزل</p>
              </div>
            </div>
          </header>

          <main className="min-h-[60vh]">
            <MenuDeliveryLayoutClient currency={settings.currency} taxRate={settings.taxRate}>
              {children}
            </MenuDeliveryLayoutClient>
          </main>
        </div>
      </OrderProvider>
    </CartProvider>
  );
}
