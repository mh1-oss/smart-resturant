"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  PanelTop, 
  CreditCard, 
  XCircle, 
  Clock,
  ChevronRight,
  Info,
  Utensils,
  BellRing,
  Trash2,
  CheckCircle2,
  Star
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { 
  closeSession, 
  claimTask, 
  serveOrder, 
  markCleaned,
  getWaiterUpdates
} from "@/app/actions/order";
import { playNotificationSound } from "@/lib/audio";

export default function WaiterClient({ 
  userId,
  initialTables, 
  initialReadyOrders,
  initialBillTasks,
  initialCleanTasks
}: { 
  userId: string | undefined,
  initialTables: any[],
  initialReadyOrders: any[],
  initialBillTasks: any[],
  initialCleanTasks: any[]
}) {
  const [tables, setTables] = useState(initialTables);
  const [readyOrders, setReadyOrders] = useState(initialReadyOrders);
  const [billTasks, setBillTasks] = useState(initialBillTasks);
  const [cleanTasks, setCleanTasks] = useState(initialCleanTasks);
  const [selectedTable, setSelectedTable] = useState<any>(null);

  // Poll for updates (simplified for now, ideally real-time)
  useEffect(() => {
    const interval = setInterval(async () => {
        try {
            const result = await getWaiterUpdates();
            if (result.success) {
                // Play sound if any task count increases
                if (
                    result.readyOrders.length > readyOrders.length ||
                    result.billTasks.length > billTasks.length ||
                    result.cleanTasks.length > cleanTasks.length
                ) {
                    playNotificationSound();
                }

                if (result.tables) setTables(result.tables);
                if (result.readyOrders) setReadyOrders(result.readyOrders);
                if (result.billTasks) setBillTasks(result.billTasks);
                if (result.cleanTasks) setCleanTasks(result.cleanTasks);
            }
        } catch (error) {
            console.error("Waiter polling failed:", error);
        }
    }, 10000);

    return () => clearInterval(interval);
  }, [readyOrders.length, billTasks.length, cleanTasks.length]);
  const handleClaim = async (type: 'Serve' | 'Bill' | 'Clean', id: number) => {
    if (!userId) return;
    const result = await claimTask(type, id, userId);
    if (result.success) {
        if (type === 'Serve') {
            setReadyOrders(prev => prev.map(o => o.id === id ? { ...o, waiter_id: userId } : o));
        } else if (type === 'Bill') {
            setBillTasks(prev => prev.map(s => s.id === id ? { ...s, bill_waiter_id: userId } : s));
        } else if (type === 'Clean') {
            setCleanTasks(prev => prev.map(s => s.id === id ? { ...s, cleaning_waiter_id: userId } : s));
        }
    }
  };

  const handleServe = async (orderId: number) => {
    const result = await serveOrder(orderId);
    if (result.success) {
        setReadyOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const handleClean = async (sessionId: number) => {
    const result = await markCleaned(sessionId);
    if (result.success) {
        setCleanTasks(prev => prev.filter(s => s.id !== sessionId));
        // Reset table status locally if needed or just wait for poll
    }
  };

  return (
    <div className="space-y-12">
      {/* Duty List / Tasks */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Serve Food */}
        <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                <Utensils className="text-rose-500" size={20} />
                توصيل الطعام ({readyOrders.length})
            </h3>
            <div className="space-y-3">
                {readyOrders.map(order => (
                    <div key={order.id} className="surface-card p-4 border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-3">
                            <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                                {order.session.table.table_number}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">طلب #{order.id}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-600 mb-4">
                            {order.items.map((i: any) => i.item_name || i.menuItem?.name || "صنف غير معروف").join(", ")}
                        </div>
                        {order.waiter_id === userId ? (
                             <button 
                               onClick={() => handleServe(order.id)}
                               className="w-full h-10 rounded-xl bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2"
                             >
                                <CheckCircle2 size={14} />
                                تم التوصيل
                             </button>
                        ) : order.waiter_id ? (
                            <div className="w-full h-10 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-black flex items-center justify-center">
                                قيد الاستلام من زميل
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleClaim('Serve', order.id)}
                                className="w-full h-10 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center gap-2"
                            >
                                <Users size={14} />
                                استلام المهمة
                            </button>
                        )}
                    </div>
                ))}
                {readyOrders.length === 0 && <p className="text-xs font-bold text-slate-300 text-center py-4">لا يوجد طعام جاهز حالياً</p>}
            </div>
        </div>

        {/* Deliver Bills */}
        <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                <CreditCard className="text-blue-500" size={20} />
                توصيل الفاتورة ({billTasks.length})
            </h3>
            <div className="space-y-3">
                {billTasks.map(session => (
                    <div key={session.id} className="surface-card p-4 border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-3">
                            <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                                {session.table.table_number}
                            </span>
                            <span className="text-[10px] font-bold text-blue-500 font-black">الفاتورة جاهزة</span>
                        </div>
                        {session.bill_waiter_id === userId ? (
                             <div className="w-full h-10 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black flex items-center justify-center text-center leading-tight">
                                بانتظار تأكيد الدفع من الكاشير
                             </div>
                        ) : session.bill_waiter_id ? (
                            <div className="w-full h-10 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-black flex items-center justify-center">
                                قيد الاستلام من زميل
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleClaim('Bill', session.id)}
                                className="w-full h-10 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center gap-2"
                            >
                                <Users size={14} />
                                استلام المهمة
                            </button>
                        )}
                    </div>
                ))}
                {billTasks.length === 0 && <p className="text-xs font-bold text-slate-300 text-center py-4">لا توجد فواتير جاهزة للتسليم</p>}
            </div>
        </div>

        {/* Clean Tables */}
        <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                <Trash2 className="text-amber-500" size={20} />
                تنظيف الطاولات ({cleanTasks.length})
            </h3>
            <div className="space-y-3">
                {cleanTasks.map(session => (
                    <div key={session.id} className="surface-card p-4 border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-3">
                            <span className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                                {session.table.table_number}
                            </span>
                            <span className="text-[10px] font-bold text-amber-500 font-black">بحاجة لتنظيف</span>
                        </div>
                        {session.cleaning_waiter_id === userId ? (
                             <button 
                               onClick={() => handleClean(session.id)}
                               className="w-full h-10 rounded-xl bg-amber-500 text-white text-xs font-black flex items-center justify-center gap-2"
                             >
                                <CheckCircle2 size={14} />
                                تم التنظيف
                             </button>
                        ) : session.cleaning_waiter_id ? (
                            <div className="w-full h-10 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-black flex items-center justify-center">
                                قيد التنظيف من زميل
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleClaim('Clean', session.id)}
                                className="w-full h-10 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center gap-2"
                            >
                                <Users size={14} />
                                استلام المهمة
                            </button>
                        )}
                    </div>
                ))}
                {cleanTasks.length === 0 && <p className="text-xs font-bold text-slate-300 text-center py-4">جميع الطاولات نظيفة</p>}
            </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Tables Overview Grid (The existing logic but updated) */}
      <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900">نظرة عامة على الطاولات</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {tables.map((table) => {
              const activeSession = table.sessions[0];
              const isOccupied = !!activeSession;

              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={cn(
                    "surface-card flex flex-col items-center justify-center p-8 border-slate-100 transition-all group hover:scale-[1.02]",
                    isOccupied 
                      ? activeSession.status === "BillRequested" || activeSession.status === "ReceiptReady"
                        ? "bg-amber-500 border-amber-500 shadow-xl shadow-amber-500/40"
                        : "bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/20" 
                      : "bg-white border-2 border-dashed border-slate-200"
                  )}
                >
                  <div className={cn(
                    "h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-black mb-4 transition-transform group-hover:scale-110",
                    isOccupied ? "bg-white/10 text-white" : "bg-slate-100 text-slate-900"
                  )}>
                    {table.table_number}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    isOccupied ? "text-white/60" : "text-slate-400"
                  )}>
                    {isOccupied ? activeSession.status : "متوفرة"}
                  </span>
                </button>
              );
            })}
          </div>
      </div>

      {/* Table Detail Sidebar (Optional, but useful to keep) */}
      {selectedTable && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
              <div className="w-[450px] bg-white h-full p-10 animate-in slide-in-from-left duration-300 relative shadow-2xl">
                  <button onClick={() => setSelectedTable(null)} className="absolute left-6 top-10 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <XCircle />
                  </button>
                  <div className="text-right mt-16 space-y-8">
                      <div>
                        <h2 className="text-3xl font-black text-slate-900">طاولة رقم {selectedTable.table_number}</h2>
                        <p className="font-bold text-slate-400">حالة الطاولة والتفاصيل</p>
                      </div>

                      {selectedTable.sessions[0] ? (
                          <div className="space-y-6">
                               <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex justify-between items-center">
                                   <span className="font-black text-slate-900">الحالة الحالية</span>
                                   <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">
                                       {selectedTable.sessions[0].status}
                                   </span>
                               </div>

                               <div className="space-y-4">
                                   <h4 className="font-black text-slate-900 text-sm">الطلبات في هذه الجلسة</h4>
                                   <div className="space-y-3">
                                       {selectedTable.sessions[0].orders.map((order: any) => (
                                           <div key={order.id} className="p-4 rounded-2xl border border-slate-100 bg-white">
                                               <div className="flex justify-between items-center mb-2">
                                                   <span className="text-[10px] font-black text-slate-400">طلب #{order.id}</span>
                                                   <span className={cn(
                                                       "text-[10px] font-black uppercase",
                                                       order.status === "Served" ? "text-emerald-500" : "text-amber-500"
                                                   )}>
                                                       {order.status === "Served" ? "تم التوصيل" : "قيد التجهيز"}
                                                   </span>
                                               </div>
                                               <div className="text-xs font-bold text-slate-600">
                                                   {order.items.map((i: any) => `${i.menuItem.name} x${i.quantity}`).join(", ")}
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                          </div>
                      ) : (
                          <div className="text-center py-20 text-slate-300 font-bold">الطاولة متوفرة حالياً</div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
