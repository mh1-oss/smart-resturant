"use client";

import { useState, useEffect } from "react";
import { Timer, CheckCircle2, ChefHat, UserCircle, Flame, RefreshCcw, Truck } from "lucide-react";
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
    <div className="relative grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 pb-20">
      {/* Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 glass-morphism px-6 py-3 rounded-full shadow-2xl transition-all animate-slide-up">
          <RefreshCcw className="h-4 w-4 text-emerald-500 animate-spin" />
          <span className="text-xs font-black text-slate-900">تحديث تلقائي...</span>
        </div>
      )}

      {orders.filter(o => o.status !== "Ready").length === 0 && (
        <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-24 bg-white/40 border-2 border-dashed border-slate-200 rounded-[3rem] animate-fade-in-up">
          <ChefHat className="h-20 w-20 text-slate-200 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-slate-300">المطبخ هادئ حالياً</h3>
          <p className="text-sm font-bold text-slate-400 mt-2">لا يوجد طلبات نشطة للتحضير</p>
        </div>
      )}

      {orders.filter(o => o.status !== "Ready").map((order) => (
        <div 
          key={order.id} 
          className={cn(
            "premium-card flex flex-col p-8 group animate-scale-in",
            order.status === "Pending" ? "ring-4 ring-amber-400/20 border-amber-200" : "border-slate-100"
          )}
        >
          {/* Status Badge - Floating */}
          <div className="absolute -top-3 -left-3 z-10">
            <div className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg",
                order.status === "Pending" ? "bg-amber-500 text-white animate-pulse" : 
                order.status === "Preparing" ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
            )}>
                {order.status === "Pending" ? "بانتظار التأكيد" : 
                 order.status === "Preparing" ? "قيد التحضير" : "جاهز"}
            </div>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className={cn(
                "h-16 w-16 rounded-3xl flex items-center justify-center text-2xl font-black shadow-xl",
                order.type === "Delivery" ? "accent-gradient text-white" : "bg-slate-900 text-white"
              )}>
                {order.type === "Delivery" ? <Truck className="h-8 w-8" /> : order.session?.table.table_number || "?"}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {order.type === "Delivery" ? (
                    <span className="flex flex-col">
                      <span className="text-[10px] text-amber-600 font-black uppercase mb-0.5 tracking-tighter">طلب توصيل رقم {order.id}</span>
                      <span className="truncate max-w-[150px]">{order.customer_name || "زبون خارجي"}</span>
                    </span>
                  ) : (
                    `طاولة ${order.session?.table.table_number || "?"}`
                  )}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-1">
                  <Timer className="h-3.5 w-3.5" />
                  <span>{new Date(order.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="mx-1">•</span>
                  <span>منذ {Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000)} دقيقة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 space-y-5 mb-8">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="flex-none h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-md">
                  {item.quantity}
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900 leading-tight text-base">{item.item_name || item.menuItem?.name || "صنف غير معروف"}</p>
                  {item.notes && (
                    <div className="mt-2 flex items-start gap-2 p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                        <Flame className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-black text-rose-600 italic leading-relaxed">{item.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-8 border-t border-slate-100 mt-auto">
            {order.status === "Pending" && (
                <button 
                  onClick={() => handleStatusUpdate(order.id, "Preparing")}
                  className="w-full pro-button h-16 text-lg group"
                >
                  <Flame className="ml-2 h-6 w-6 transition-transform group-hover:scale-125 group-hover:rotate-12" />
                  بدء التحضير
                </button>
            )}
            
            {order.status === "Preparing" && (
                <button 
                  onClick={() => handleStatusUpdate(order.id, "Ready")}
                  className="w-full h-16 flex items-center justify-center gap-2 rounded-2xl font-black text-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <CheckCircle2 className="ml-2 h-6 w-6" />
                  جاهز للتسليم
                </button>
            )}
          </div>
        </div>
      ))}
    </div>

  );
}
