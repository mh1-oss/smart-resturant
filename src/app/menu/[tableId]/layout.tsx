import { UtensilsCrossed } from "lucide-react";
import { getSettings } from "@/app/actions/settings";
import MenuLayoutClient from "./MenuLayoutClient";
import MenuHeaderActions from "./MenuHeaderActions";
import { OrderProvider } from "@/context/OrderContext";
import { CartProvider } from "@/context/CartContext";

export default async function CustomerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tableId: string }>;
}) {
  const { tableId } = await params;
  const settings = await getSettings();

  return (
    <CartProvider>
      <OrderProvider>
        <div className="min-h-screen bg-[#f8fafc] pb-24 text-right" dir="rtl">
          {/* App Header */}
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300">
          <div className="mx-auto max-w-3xl px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 relative">
            {/* Right Side (Logo) */}
            <div className="flex justify-start min-w-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/10 shrink-0">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
            </div>

            {/* True Center Action (Request Bill) */}
            <div className="flex justify-center shrink-0 px-2 lg:px-4">
              <MenuHeaderActions />
            </div>

            {/* Left Side (Branding) */}
            <div className="flex flex-col items-start min-w-0 text-left">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight truncate w-full">{settings.restaurantName}</h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate w-full">طاولة رقم {tableId}</p>
            </div>
          </div>
          </header>

          <main className="mx-auto max-w-3xl min-h-[60vh] px-6">
            <MenuLayoutClient currency={settings.currency} taxRate={settings.taxRate}>
              {children}
            </MenuLayoutClient>
          </main>
        </div>
      </OrderProvider>
    </CartProvider>
  );
}
