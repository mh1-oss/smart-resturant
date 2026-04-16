import { getCashierStats } from "@/app/actions/financials";
import { getSettings } from "@/app/actions/settings";
import { getCashierSessions } from "@/app/actions/order";
import CashierClient from "./CashierClient";

export const dynamic = "force-dynamic";

export default async function CashierPage() {
  const settings = await getSettings();
  const { stats } = await getCashierStats();
  const sessions = await getCashierSessions();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">شاشة الكاشير</h1>
          <p className="font-bold text-slate-500">مراقبة المبيعات وتأكيد الدفع</p>
        </div>
      </div>

      <CashierClient 
        initialSessions={sessions} 
        initialStats={stats} 
        settings={settings} 
        fetchSessionsAction={getCashierSessions}
      />
    </div>
  );
}
