"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, format } from "date-fns";
import { arSA } from "date-fns/locale";
import { revalidatePath } from "next/cache";

export async function getAdminStats() {
  try {
    const today = startOfDay(new Date());
    const weekStart = subDays(today, 6);
    const monthStart = subDays(today, 29);

    // 1. Fetch data
    const [orderItems, expensesList, allOrders] = await Promise.all([
      prisma.orderItem.findMany({ include: { order: true } }),
      (prisma as any).expense.findMany(),
      (prisma as any).order.findMany({ where: { status: "Served" } })
    ]);

    const settingsRaw = await prisma.setting.findMany({ where: { key: "taxRate" } });
    const taxRate = settingsRaw.find((s: any) => s.key === "taxRate")?.value || "0";
    const taxMultiplier = 1 + (Number(taxRate) / 100);

    const calculateStats = (items: any[], expenses: any[], orders: any[]) => {
      const baseRevenue = items.reduce((acc, item) => acc + (Number(item.price_at_time) * item.quantity), 0);
      const revenue = baseRevenue * taxMultiplier;
      const cost = items.reduce((acc, item) => acc + (Number(item.cost_at_time || 0) * item.quantity), 0);
      const totalExpenses = expenses.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);
      return {
        revenue: Number(revenue) || 0,
        cost: Number(cost) || 0,
        expenses: Number(totalExpenses) || 0,
        profit: (Number(baseRevenue) || 0) - (Number(cost) || 0) - (Number(totalExpenses) || 0),
        orderCount: orders.length
      };
    };

    // Filter and Calculate
    const stats = {
      today: calculateStats(
        orderItems.filter(i => i.order.created_at >= today),
        expensesList.filter((e: any) => e.date >= today),
        allOrders.filter((o: any) => o.created_at >= today)
      ),
      weekly: calculateStats(
        orderItems.filter(i => i.order.created_at >= weekStart),
        expensesList.filter((e: any) => e.date >= weekStart),
        allOrders.filter((o: any) => o.created_at >= weekStart)
      ),
      monthly: calculateStats(
        orderItems.filter(i => i.order.created_at >= monthStart),
        expensesList.filter((e: any) => e.date >= monthStart),
        allOrders.filter((o: any) => o.created_at >= monthStart)
      ),
      allTime: calculateStats(orderItems, expensesList, allOrders)
    };

    // 3. Chart Data (Last 7 days - keeping current logic but optimized)
    const chartData = await Promise.all([...Array(7)].map(async (_, i) => {
      const date = subDays(today, i);
      const baseDayRevenue = orderItems
        .filter(i => 
          i.order.created_at >= startOfDay(date) && 
          i.order.created_at <= new Date(new Date(date).setHours(23, 59, 59, 999))
        )
        .reduce((acc, item) => acc + (Number(item.price_at_time) * item.quantity), 0);
      
      return {
        name: format(date, "EEE", { locale: arSA }),
        revenue: baseDayRevenue * taxMultiplier
      };
    })).then(data => data.reverse());

    return {
      success: true,
      stats,
      chartData
    };
  } catch (error) {
    console.error("Financial stats error:", error);
    return { success: false, error: "فشل في جلب البيانات المالية" };
  }
}

export async function getCashierStats() {
    try {
        const today = startOfDay(new Date());
        
        // Count all orders that belong to sessions closed today or active sessions handled today
        const sessions = await (prisma as any).customerSession.findMany({
            where: {
                OR: [
                    { status: "Closed", closed_at: { gte: today } },
                    { status: "CleaningRequired" as any }
                ]
            },
            include: {
                orders: {
                    where: { status: "Served" },
                    include: { items: true }
                }
            }
        });

        const settingsRaw = await prisma.setting.findMany({ where: { key: "taxRate" } });
        const taxRate = settingsRaw.find((s: any) => s.key === "taxRate")?.value || "0";
        const taxMultiplier = 1 + (Number(taxRate) / 100);

        let baseRevenue = 0;
        let orderCount = 0;

        sessions.forEach((session: any) => {
            session.orders.forEach((order: any) => {
                orderCount++;
                order.items.forEach((item: any) => {
                    baseRevenue += Number(item.price_at_time) * item.quantity;
                });
            });
        });

        return {
            success: true,
            stats: {
                revenue: baseRevenue * taxMultiplier,
                orderCount
            }
        };
    } catch (error) {
        console.error("Cashier stats error:", error);
        return { success: false, error: "فشل في جلب إحصائيات الكاشير" };
    }
}

export async function clearAllFinancialData() {
    try {
        // 1. Delete all expense records
        await (prisma as any).expense.deleteMany({});
        
        // 2. Safely delete hierarchically to prevent any relation constraints (OrderItems -> Orders -> Sessions)
        await (prisma as any).orderItem.deleteMany({});
        await (prisma as any).order.deleteMany({});
        await (prisma as any).customerSession.deleteMany({});

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/archive");
        revalidatePath("/admin/cashier");

        return { success: true };
    } catch (error) {
        console.error("Reset financials error:", error);
        return { success: false, error: "فشل في تصفير البيانات المالية" };
    }
}
