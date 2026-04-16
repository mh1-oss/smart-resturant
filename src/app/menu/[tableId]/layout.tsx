import { UtensilsCrossed } from "lucide-react";
import { getSettings } from "@/app/actions/settings";
import MenuLayoutClient from "./MenuLayoutClient";

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
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* App Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-black text-slate-900">{settings.restaurantName}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">طاولة رقم {tableId}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl min-h-[60vh]">
        {children}
      </main>

      <MenuLayoutClient />
    </div>
  );
}
