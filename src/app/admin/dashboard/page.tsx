import { getAdminStats } from "@/app/actions/financials";
import { getExpenses } from "@/app/actions/expense";
import { getSettings } from "@/app/actions/settings";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

const emptyPeriod = { revenue: 0, cost: 0, expenses: 0, profit: 0, orderCount: 0 };

export default async function AdminDashboardPage() {
  const settings = await getSettings();
  const { stats, chartData } = await getAdminStats();
  const { expenses } = await getExpenses();

  const fallbackStats = {
      today: emptyPeriod,
      weekly: emptyPeriod,
      monthly: emptyPeriod,
      allTime: emptyPeriod
  };

  return (
    <DashboardClient 
      stats={stats || fallbackStats} 
      chartData={chartData || []} 
      initialExpenses={expenses || []} 
      currency={settings?.currency || "USD"} 
    />
  );
}
