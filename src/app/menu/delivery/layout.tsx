import { UtensilsCrossed, Truck } from "lucide-react";
import { getSettings } from "@/app/actions/settings";
import MenuDeliveryLayoutClient from "./MenuDeliveryLayoutClient";
import Script from "next/script";

export default async function DeliveryLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <div className="min-h-screen pb-24 text-right" style={{ backgroundColor: 'var(--theme-bg)' }} dir="rtl">
      {/* App Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl transition-all duration-300 border-b border-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-3xl px-6 h-20 flex items-center justify-between gap-4">
          {/* Left Side: Service Status */}
          <div className="flex-1 flex justify-start">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-50/50 border border-slate-100 shadow-inner">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pt-0.5 whitespace-nowrap">وضع المنيو أونلاين</span>
            </div>
          </div>

          {/* Right Side: Branding (Logo + Name + Mode) */}
          <div className="flex items-center gap-3.5 sm:gap-4 text-right overflow-hidden shrink-0">
            <div className="flex flex-col items-end min-w-0">
              <h1 className="text-[16px] sm:text-lg font-black text-slate-900 leading-tight truncate w-full">{settings.restaurantName}</h1>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">خدمة التوصيل للمنزل</p>
            </div>
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-[18px] sm:rounded-[20px] bg-gradient-to-br from-[var(--brand-primary)] to-emerald-600 flex items-center justify-center text-white shadow-xl overflow-hidden shrink-0 ring-4 ring-slate-50 transition-transform active:scale-95">
               <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>
      </header>

      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossOrigin="" />

      <main className="min-h-[60vh]">
        <MenuDeliveryLayoutClient 
          currency={settings.currency} 
          taxRate={settings.taxRate}
          deliveryFee={settings.deliveryFee}
        >
          {children}
        </MenuDeliveryLayoutClient>
      </main>
    </div>
);
}
