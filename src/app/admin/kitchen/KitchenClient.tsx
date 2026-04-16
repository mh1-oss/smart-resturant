"use client";

import { useState, useEffect } from "react";
import { Timer, CheckCircle2, ChefHat, UserCircle, Flame, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateOrderStatus, getActiveOrders } from "@/app/actions/order";
import { playNotificationSound } from "@/lib/audio";

export default function KitchenClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll for new orders every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      setIsRefreshing(true);
      try {
        const result = await getActiveOrders();
        if (result.success && result.orders) {
          // Play sound if new orders are added
          if (result.orders.length > orders.length) {
            playNotificationSound();
          }
          setOrders(result.orders);
        }
      } catch (error) {
        console.error("Polling failed:", error);
      } finally {
        setIsRefreshing(false);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [orders.length]);

  const handleStatusUpdate = async (orderId: number, nextStatus: string) => {
    // Optimistic update
    const previousOrders = [...orders];
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));

    const result = await updateOrderStatus(orderId, nextStatus);
    if (!result.success) {
      setOrders(previousOrders);
      alert(result.error);
    }
  };

  return (
    <div className="relative grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {/* Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-full shadow-sm">
          <RefreshCcw className="h-4 w-4 text-slate-400 animate-spin" />
          <span className="text-xs font-bold text-slate-500">تم التحديث...</span>
        </div>
      )}

      {orders.filter(o => o.status !== "Ready").length === 0 && (
        <div className="md:col-span-3 text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px]">
          <ChefHat className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <p className="text-xl font-black text-slate-300">لا يوجد طلبات نشطة في المطبخ حالياً</p>
        </div>
      )}

      {orders.filter(o => o.status !== "Ready").map((order) => (
        <div 
          key={order.id} 
          className={cn(
            "surface-card flex flex-col p-8 border-slate-100 transition-all duration-500",
            order.status === "Pending" ? "ring-2 ring-amber-400 shadow-xl shadow-amber-400/10" : "shadow-lg"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black">
                {order.session.table.table_number}
              </div>
              <div>
                <h3 className="font-black text-slate-900">طاولة {order.session.table.table_number}</h3>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Timer className="h-3.5 w-3.5" />
                  <span>{new Date(order.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            <div className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                order.status === "Pending" ? "bg-amber-100 text-amber-600" : 
                order.status === "Preparing" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
            )}>
                {order.status === "Pending" ? "بانتظار التأكيد" : 
                 order.status === "Preparing" ? "قيد التحضير" : "جاهز للتسليم"}
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 space-y-4 mb-8">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-start justify-between group">
                <div className="flex gap-4">
                  <span className="flex-none h-6 w-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs">
                    {item.quantity}
                  </span>
                  <div>
                    <p className="font-black text-slate-900 leading-tight">{item.item_name || item.menuItem?.name || "صنف غير معروف"}</p>
                    {item.notes && (
                      <p className="text-xs font-bold text-rose-500 mt-1 italic">ملاحظة: {item.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-100">
            {order.status === "Pending" && (
                <button 
                  onClick={() => handleStatusUpdate(order.id, "Preparing")}
                  className="col-span-2 premium-button h-14 bg-rose-600 text-white hover:bg-rose-700"
                >
                  <Flame className="ml-2 h-5 w-5" />
                  بدء التحضير
                </button>
            )}
            
            {order.status === "Preparing" && (
                <button 
                  onClick={() => handleStatusUpdate(order.id, "Ready")}
                  className="col-span-2 premium-button h-14 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="ml-2 h-5 w-5" />
                  جاهز للتسليم
                </button>
            )}

            {order.status === "Ready" && (
                <div className="col-span-2 flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black">
                    <CheckCircle2 className="h-5 w-5" />
                    تم التجهيز
                </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
