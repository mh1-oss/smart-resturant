import { UtensilsCrossed } from "lucide-react";
import { getSettings } from "@/app/actions/settings";
import MenuLayoutClient from "./MenuLayoutClient";
import MenuHeaderActions from "./MenuHeaderActions";

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
    <div className="min-h-screen pb-24 text-right" style={{ backgroundColor: 'var(--theme-bg)' }} dir="rtl">
      {/* App Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl transition-all duration-300 border-b border-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-3xl px-6 h-20 flex items-center justify-between gap-4">
          {/* Left Side: Action (Request Bill) */}
          <div className="flex-1 flex justify-start">
            <MenuHeaderActions />
          </div>

          {/* Right Side: Branding (Logo + Name + Table) */}
          <div className="flex items-center gap-3.5 sm:gap-4 text-right overflow-hidden shrink-0">
            <div className="flex flex-col items-end min-w-0">
              <h1 className="text-[16px] sm:text-lg font-black text-slate-900 leading-tight truncate w-full">{settings.restaurantName}</h1>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="relative flex h-1.5 w-1.5 shrink-0 mb-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">طاولة رقم {tableId}</p>
              </div>
            </div>
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-[18px] sm:rounded-[20px] bg-gradient-to-br from-[var(--brand-primary)] to-slate-900 flex items-center justify-center text-white shadow-xl overflow-hidden shrink-0 ring-4 ring-slate-50 transition-transform active:scale-95">
               <UtensilsCrossed className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-[60vh]">
        <MenuLayoutClient currency={settings.currency} taxRate={settings.taxRate} tableId={tableId}>
          {children}
        </MenuLayoutClient>
      </main>
    </div>
);
}
